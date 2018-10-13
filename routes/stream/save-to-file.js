const fs = require('fs');
const StreamDB = require('../../models/stream');
const getLastFileName = require('./get-last-file-name');
const getNextFileName = require('./get-next-file-name');

module.exports = class SaveToFile {
  constructor({ id }) {
    this.id = id;
    this.lastFileName = null;
  }

  save({ head, cluster, endFile }) {
    const promise = new Promise((resolve, reject) => {
      this.getLastFileName()
        .then(() => {
          if (head) {
            const data = (cluster)
              ? Buffer.concat([head, cluster])
              : head;

            if (this.wstream) {
              this.endFileStream({ data: endFile })
                .then(() => {
                  this.createFileStream(data);
                  resolve();
                })
                .catch((e) => {
                  reject(e);
                });
              return;
            }
            this.createFileStream(data)
              .then(() => {
                resolve();
              })
              .catch((e) => {
                reject(e);
              });
            return;
          }
          if (this.wstream) {
            this.wstream.write(cluster);
          }
          resolve();
        })
        .catch((e) => {
          reject(e);
        });
    });

    return promise;
  }



  createFileStream(data) {
    const promise = new Promise((resolve, reject) => {
      this.nextFileName = getNextFileName({ lastFileName: this.lastFileName, id: this.id });
      this.lastFileName = this.nextFileName;
      this.addFileNameToDB({ fileName: this.lastFileName })
        .then(() => {
          this.wstream = fs.createWriteStream(`${this.nextFileName}.webm`);
          this.wstream.on('open', () => {
            this.wstream.write(data);
            resolve();
          });
          this.wstream.on('error', (e) => {
            reject(e);
          })
        });
    });

    return promise;
  }

  endFileStream({ data }) {
    const promise = new Promise((resolve, reject) => {
      if (!this.wstream) {
        resolve();
        return;
      }
      this.wstream.on('finish', () => {
        resolve();
      });
      this.wstream.on('error', (e) => {
        reject(e);
      });

      if (data) {
        this.wstream.end(data);
        return;
      }
      this.wstream.end();
    });
    return promise;
  }

  addFileNameToDB({ fileName }) {
    const promise = new Promise((resolve) => {
      StreamDB.findOne({ streamId: this.id })
        .then((streamDB) => {
          streamDB.files.push(fileName);
          return streamDB.save();
        })
        .then(() => {
          resolve();
        });
    });
    return promise;
  }

  getLastFileName() {
    const promise = new Promise((resolve, reject) => {
      if (this.lastFileName) {
        resolve(this.lastFileName);
        return;
      }

      StreamDB.findOne({ streamId: this.id })
        .then((streamDB) => {
          // создать данные о новом стриме в базе данных
          if (!streamDB) {
            const streamDB = new StreamDB({
              streamId: this.id,
              files: [],
            });
            return streamDB.save();
          }
          return streamDB;
        })
        .then((streamDB) => {
          this.lastFileName = getLastFileName({ files: streamDB.files });
          resolve(this.lastFileName);
        })
        .catch((e) => {
          reject(e);
        });
    });
    return promise;
  }
}
