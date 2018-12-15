const StreamDB = require('../../models/stream');

module.exports = (decoder, streams, req, res, next) => {
  const id = req.body.id;
  const response = {};

  id.forEach((item) => {
    if (decoder.isStreamDecoded({ streamId: item })) {
      response[item] = {
        status: 'decode',
      };

      return;
    }
    if (streams[item]) {
      response[item] = {
        status: 'stream',
      };

      return;
    }
  });

  StreamDB.find({ streamId: id, decodedVideo: /^.*$/ })
    .then((stream) => {
      stream.forEach((item) => {
        if (!response[item.streamId]) {
          response[item.streamId] = {
            status: 'recorded',
            fileName: item.decodedVideo,
          };
        }
      });
      res.json(response);
    })
    .catch((e) => {
      next(e);
    })
};
