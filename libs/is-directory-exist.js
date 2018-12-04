const fs = require('fs');

module.exports = ({ path }) => {
  const promise = new Promise((resolve, reject) => {

    fs.stat(path, (err) => {

      if (err === null) {
        resolve(true);
        return;
      }

      if (err.code === 'ENOENT') {
        resolve(false);
        return;
      }

      reject(err.code);
    });

  });

  return promise;
}
