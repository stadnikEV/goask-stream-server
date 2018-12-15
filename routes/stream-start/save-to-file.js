const config = require('../../config');
const getFileName = require('./get-file-name');
const finishFileStream = require('./finish-file-stream');
const createWriteStream = require('../../libs/create-write-stream');
const addFileNameToDB = require('../../libs/add-file-name-to-db');

module.exports = class SaveToFile {
  constructor({ id }) {
    this.id = id;
  }

  save({ head, cluster, endFile }) {
    const promise = new Promise((resolve, reject) => {
      if (head) {
        const data = (cluster)
          ? Buffer.concat([head, cluster])
          : head;

        if (this.wstream) {
          finishFileStream({ wstream: this.wstream, data: endFile })
            .then(() => {
              this.fileName += 1;
              return createWriteStream({ path: `${config.get('videoPath')}/${this.id}/`, fileName: `${this.fileName}.webm` });
            })
            .then((wstream) => {
              this.wstream = wstream;
              this.wstream.write(data);
              return addFileNameToDB({ streamId: this.id, fileName: `${this.fileName}.webm` });
            })
            .then(() => {
              resolve();
            })
            .catch((e) => {
              reject(e);
            });

          return;
        }

        getFileName({ streamId: this.id })
          .then((fileName) => {
            this.fileName = fileName;
            return createWriteStream({ path: `${config.get('videoPath')}/${this.id}/`, fileName: `${this.fileName}.webm` })
          })
          .then((wstream) => {
            this.wstream = wstream;
            this.wstream.write(data);
            return addFileNameToDB({ streamId: this.id, fileName: `${this.fileName}.webm` });
          })
          .then(() => {
            resolve();
          })
          .catch((e) => {
            reject(e);
          });

        return;
      }

      this.wstream.write(cluster);
      resolve();
    });

    return promise;
  }


  endFileStream({ data }) {
    const promise = new Promise((resolve, reject) => {
      if (!this.wstream) {
        resolve();

        return;
      }
      finishFileStream({ wstream: this.wstream, data })
        .then(() => {
          resolve();
        })
        .catch((e) => {
          reject(e);
        })
    });

    return promise;
  }
}
