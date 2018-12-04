const fs = require('fs');
const isDirectoryExist = require('../../libs/is-directory-exist');
const creatreDirectory = require('../../libs/create-directory');

module.exports = ({ path, fileName }) => {
  const promise = new Promise((resolve, reject) => {
    isDirectoryExist({ path })
      .then((isExist) => {
        if (isExist) {
          return;
        }

        return creatreDirectory({ path });
      })
      .then(() => {
        const wstream = fs.createWriteStream(path + fileName);

        wstream.on('open', () => {
          resolve(wstream);
        });

        wstream.on('error', (e) => {
          reject(e);
        })
      })
      .catch((e) => {
        reject(e);
      });
  });

  return promise;
};
