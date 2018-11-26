const fs = require('fs');

module.exports = ({ path, fileName }) => {
  const promise = new Promise((resolve, reject) => {

    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }

    const wstream = fs.createWriteStream(path + fileName);

    wstream.on('open', () => {
      resolve(wstream);
    });

    wstream.on('error', (e) => {
      reject(e);
    })
  });

  return promise;
};
