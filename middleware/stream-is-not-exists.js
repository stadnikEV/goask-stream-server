const HttpError = require('../error');

module.exports = (streams, req, res, next) => {
  const id = req.params.id;
  let streamId = streams[`${id}`];

  if (streamId) {
    next(new HttpError({
      status: 403,
      message: 'The stream already exists',
    }));

    return;
  }

  next();
};
