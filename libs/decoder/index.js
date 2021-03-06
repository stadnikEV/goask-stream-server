const config = require('../../config');
const ffmpeg = require('../../libs/ffmpeg');

module.exports = class StreamId {
  constructor({ emitter }) {

    this.emitter = emitter;
    this.stack = [];
  }

  add({ streamId, originalFile, targetFile }) {
    const promise = new Promise((resolve, reject) => {
      this.stack.push({ streamId, originalFile, targetFile });

      const endDecode = (err) => {
        this.emitter.removeListener(`end-decode-${streamId}`, endDecode);
        if (!err) {
          resolve();
          return;
        }
        reject(err);
      }

      this.emitter.on(`end-decode-${streamId}`, endDecode);

      if (this.stack.length !== 1) {
        return;
      }

      this.decode();
    });

    return promise;
  }


  decode() {
    if (!this.stack[0]) {
      return;
    }
    const streamId = this.stack[0].streamId;
    const originalFile = this.stack[0].originalFile;
    const targetFile = this.stack[0].targetFile;

    ffmpeg({
      path: `${config.get('videoPath')}/${streamId}/`,
      originalFile,
      targetFile,
    })
    .then(() => {
      this.emitter.emit(`end-decode-${streamId}`);
      this.stack.shift();
      this.decode();
    })
    .catch((err) => {
      this.emitter.emit(`end-decode-${streamId}`, err);
      this.stack.shift();
      this.decode();
    });
  }

  isStreamDecoded({ streamId }) {
    return this.stack.some((item) => {
      return item.streamId === streamId;
    });
  }
}
