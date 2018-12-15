const StreamDB = require('../models/stream');
const HttpError = require('../error');

module.exports = (streams, req, res, next) => {
  const id = req.params.id;

  StreamDB.findOne({ streamId: id})
    .then((stream) => {
      if (!stream) {
        return Promise.reject(new HttpError({
          status: 403,
          message: 'No files to encode',
        }));
      }
      if (!stream.originVideo[0]) {
        return Promise.reject(new HttpError({
          status: 403,
          message: 'No files to encode',
        }));
      }

      res.locals.streamDB = stream;

      next();
    })
    .catch((e) => {
      next(e);
    });
};
