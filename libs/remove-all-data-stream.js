const StreamDB = require('../models/stream.js');
const isDirectoryExist = require('../libs/is-directory-exist');
const removeDirectory = require('../libs/remove-directiory');

module.exports = ({ streamId }) => {
  const promise = new Promise((resolve, reject) => {

    StreamDB.findOne({ streamId })
      .then((stream) => {

        if (!stream) {
          return;
        }

        return StreamDB.remove({ _id: stream._id });
      })
      .then(() => {
        return isDirectoryExist({ path: `video/${streamId}` });
      })
      .then((isExist) => {
        if (!isExist) {
          return;
        }

        return removeDirectory({ path: `video/${streamId}` });
      })
      .then(() => {
        resolve();
      })
      .catch((e) => {
        reject(e);
      });
  });

  return promise;
};
