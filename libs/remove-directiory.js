var rimraf = require('rimraf');

module.exports = ({ path }) => {
  const promise = new Promise((resolve, reject) => {
    rimraf(path, (err) => {
      if (err === null) {
        resolve();
        return;
      }

      reject(err);
    });
  });

  return promise;
};
