const StreamDB = require('../models/stream');

module.exports = ({ streamId, fileName }) => {
  const promise = new Promise((resolve, reject) => {
    StreamDB.findOne({ streamId })
      .then((stream) => {
        let streamDB = stream;

        if (!streamDB) {
          streamDB = new StreamDB({
            streamId,
            originVideo: [],
          });
        }

        streamDB.originVideo.push(fileName);
        return streamDB.save();
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
