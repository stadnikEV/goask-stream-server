const fs = require('fs');

module.exports = ({ path }) => {
  const promise = new Promise((resolve, reject) => {
    fs.mkdir(path, (err) => {
      if (err === null) {
        resolve();
        return;
      }
      reject(err);
    })
  });

  return promise;
}
