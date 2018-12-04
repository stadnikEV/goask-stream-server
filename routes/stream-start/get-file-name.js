const StreamDB = require('../../models/stream');

module.exports = ({ streamId }) => {
  const promise = new Promise((resolve, reject) => {
    StreamDB.findOne({ streamId })
      .then((streamDB) => {

        if (!streamDB) {
          resolve(1);

          return;
        }
        
        const lastName = streamDB.files[streamDB.files.length - 1];
        const fileName = lastName + 1;
        resolve(fileName);
      })
      .catch((e) => {
        reject(e);
      });
  });

  return promise;
};
