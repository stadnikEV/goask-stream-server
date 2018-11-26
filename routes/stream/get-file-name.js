const StreamDB = require('../../models/stream');

module.exports = ({ streamId }) => {
  const promise = new Promise((resolve, reject) => {
    StreamDB.findOne({ streamId })
      .then((streamDB) => {
        if (!streamDB) {
          resolve(1);
          return;
        }

        const fileName = streamDB.files.length;
        resolve(fileName);
      })
      .catch((e) => {
        reject(e);
      });
  });

  return promise;
};
