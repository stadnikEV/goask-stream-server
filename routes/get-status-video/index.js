const StreamDB = require('../../models/stream');

module.exports = (decoder, req, res, next) => {
  const id = req.body.id;
  const response = {};

  id.forEach((item) => {
    if (decoder.isStreamDecoded({ streamId: item })) {
      response[item] = 'decode';
    }
  });

  StreamDB.find({ streamId: id, mp4: /^.*$/ })
    .then((stream) => {
      stream.forEach((item) => {
        response[item.streamId] = 'recorded';
      });
      res.json(response);
    })
    .catch((e) => {
      next(e);
    })
};
