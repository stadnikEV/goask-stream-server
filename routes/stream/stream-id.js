const webmParser = require('./webm-parser');
const SaveToFile = require('./save-to-file');
const ChunkingBuffer = require('./chunking-buffer');
const getStartByteForParser = require('./get-start-byte-for-parser');


const HttpError = require('../../error');

module.exports = class StreamId {
  constructor({ emitter, id, streams }) {

    this.emitter = emitter;
    this.id = id;
    this.streams = streams;

    this.buffer = Buffer.alloc(0);
    this.head = null;
    this.cluster = null;

    this.isHeaderStart = false,
    this.isClusterStart = false,

    this.saveToFile = new SaveToFile({ id });
    this.chunkingBuffer = new ChunkingBuffer();
  }

  addToStream({ data }) {
    const promise = new Promise((resolve, reject) => {

      if (this.isBusy || this.isStop) {
        const httpError = new HttpError({
          status: 403,
          message: 'Stream not available for writing',
        });
        reject(httpError);

        return;
      }

      this.isBusy = true;
      this.setDestroyDelay();

      this.buffer = this.addToBuffer({ data });

      const startByte = getStartByteForParser({ buffer: this.buffer,  newDataBuffer: this.newDataBuffer });
      const cutPoints = webmParser({ stream: this.buffer, start: startByte });

      if (!cutPoints) {
        this.isBusy = false;
        resolve();
        return;
      }

      const chunks = this.chunkingBuffer.getChunks({
        buffer: this.buffer,
        cutPoints,
      });

      if (!chunks) {
        this.isBusy = false;
        resolve();
        return;
      }

      if (chunks.newBuffer) {
        this.buffer = chunks.newBuffer;
      }
      if (chunks.head) {
        this.head = chunks.head;
      }
      if (chunks.cluster) {
        this.cluster = chunks.cluster;
      }

      if (!this.head && this.cluster) {
        const httpError = new HttpError({
          status: 400,
          message: 'Not correct video data',
        });
        reject(httpError);

        return;
      }

      this.saveToFile.save({
        head: chunks.head,
        cluster: chunks.cluster,
        endFile: chunks.endOfFile,
      })
        .then(() => {
          this.isBusy = false;
          this.emitStreamReady()
          resolve();
        })
        .catch((e) => {
          reject(e);
        });

    });

    return promise;
  }


  setDestroyDelay() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.stopStream()
        .then(() => {
          this.destroy();
        })
        .catch(() => {
          this.destroy();
        });
    }, 7000);
  }

  emitStreamReady() {
    this.emitter.emit(`stream-ready-${this.id}`);
  }

  addToBuffer({ data }) {
    this.newDataBuffer = Buffer.concat(data);
    return Buffer.concat([this.buffer, this.newDataBuffer]);
  }

  stopStream({ data } = {}) {
    const promise = new Promise((resolve, reject) => {
      if (this.isStop) {
        const httpError = new HttpError({
          status: 403,
          message: 'The write stream is already stopped',
        });
        reject(httpError);

        return;
      }

      this.isStop = true;

      if (data) {
        this.buffer = this.addToBuffer({ data });
      }

      const endStream = () => {
        this.emitter.removeListener(`stream-ready-${this.id}`, endStream);
        this.saveToFile.endFileStream({ data: this.buffer })
          .then(() => {
            resolve();
          })
          .catch((e) => {
            reject(e);
          });
      }

      if (this.isBusy) {
        this.emitter.on(`stream-ready-${this.id}`, endStream);
        return;
      }

      endStream();
    });

    return promise;
  }

  destroy() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.saveToFile = null;
    this.chunkingBuffer = null;
    delete this.streams[`${this.id}`];
  }
}
