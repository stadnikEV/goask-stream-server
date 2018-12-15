const fs = require('fs');

module.exports = ({ path }) => {
  const promise = new Promise((resolve, reject) => {

    fs.stat(path, (err, stats) => {

      if (err === null) {
        resolve(stats);
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
