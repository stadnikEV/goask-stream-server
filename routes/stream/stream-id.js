const webmParser = require('./webm-parser');
const SaveToFile = require('./save-to-file');
const HttpError = require('../../error');

module.exports = class StreamId {
  constructor({ emitter, id, streams }) {

    this.emitter = emitter;
    this.id = id;
    this.streams = streams;

    this.buffer = Buffer.alloc(0);
    this.head = null;
    this.cluster = null;

    this.saveToFile = new SaveToFile({ id });
  }

  addToStream({ data }) {
    const promise = new Promise((resolve, reject) => {

      if (this.state === 'destroy') {
        const httpError = new HttpError({
          status: 403,
          message: 'stream is busy',
        });
        reject(httpError);
        return;
      }

      const newDataBuffer = Buffer.concat(data);
      this.buffer = Buffer.concat([this.buffer, newDataBuffer]);

      this.destroyDelay();

      if (this.stop) {
        this.state = 'destroy';
        clearTimeout(this.timer);
        this.cluster = this.buffer;
        this.saveToFile.endFileStream({ data: this.cluster })
          .then(() => {
            resolve();
          })
          .catch((e) => {
            reject(e);
          });
      }

      const startByte = (this.buffer.length - newDataBuffer.length > 2)
        ? this.buffer.length - newDataBuffer.length - 3
        : 0;

      const cutPoints = webmParser({ stream: this.buffer, start: startByte });
      const chunks = this.chunkingBuffer(cutPoints);
      if (chunks) {
        this.chunkHendler(chunks)
          .then(() => {
            resolve();
          })
          .catch((e) => {
            reject(e);
          });
        return;
      }
      resolve();
    });

    return promise;
  }

  destroyDelay() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.state = 'destroy';
      this.stopStrem();
      this.saveToFile.endFileStream({ data: this.buffer })
        .then(() => {
          const listenersCount = this.emitter.listeners(`cluster-${this.id}`).length;
          if (listenersCount) {
            this.cluster = null;
            this.emitCluster();
            return;
          }
          console.log(' стрим удален');
          delete this.streams[`${this.id}`];
        })
    }, 10000);
  }

  chunkingBuffer(cutPoints) {
    let headerStart = cutPoints.headerStart[0];
    let clusterStart = cutPoints.clusterStart[0];
    let clusterEnd = (cutPoints.clusterStart.length > 1)
      ? cutPoints.clusterStart[cutPoints.clusterStart.length - 1]
      : null;

    let bufferStart = 0;
    let endOfFile = null;
    let head = null;
    let cluster = null;
    // определить начальный байт заголовка
    if (headerStart !== undefined) {
      this.headerStart = true;
      this.clusterStart = false;
      if (headerStart !== 0) {
        endOfFile = this.buffer.slice(0, headerStart);
        bufferStart = headerStart;
      }
    }

    if (clusterStart !== undefined) {
      // получить заголовок
      if (this.headerStart) {
        this.headerStart = false;
        headerStart = (headerStart !== 0)
          ? headerStart
          : 0;
        head = this.buffer.slice(headerStart, clusterStart);
        bufferStart = clusterStart;
      }
      // получить cluster если он есть
      clusterEnd = (clusterEnd)
        ? clusterEnd
        : clusterStart;
      if (this.clusterStart) {
        clusterStart = 0;
      }

      if (clusterStart !== clusterEnd) {
        cluster = this.buffer.slice(clusterStart, clusterEnd);
        bufferStart = clusterEnd;
      }
      this.clusterStart = (clusterEnd < this.buffer.length)
        ? true
        : false;
    }
    const buffer = this.buffer.slice(bufferStart);
    const result = (head || cluster)
      ? { buffer, head, cluster, endOfFile }
      : null;
    return result;
  }

  chunkHendler(chunks) {
    this.buffer = chunks.buffer;

    if (chunks.head) {
      this.head = chunks.head;
    }
    if (chunks.cluster) {
      if (!this.head) {
        return Promise.reject(new HttpError({
            status: 403,
            message: 'There is no head',
          }));
      }
      if (chunks.cluster && !chunks.head) {
        this.cluster = chunks.cluster;
      }
      if (chunks.cluster && chunks.head) {
        this.cluster = Buffer.concat([chunks.head, chunks.cluster]);
      }
      this.emitCluster();
    }
    return this.saveToFile.save({
      head: chunks.head,
      cluster: chunks.cluster,
      endFile: chunks.endFile,
    })
  }

  emitCluster() {
    this.emitter.emit(`cluster-${this.id}`, this.cluster);
  }

  isStop() {
    if (this.stop) {
      return true;
    }
    return false;
  }

  stopStrem() {
    this.stop = true;
  }
}
