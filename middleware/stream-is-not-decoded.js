const HttpError = require('../error');

module.exports = (decoder, req, res, next) => {
  const id = req.params.id;

  if (decoder.isStreamDecoded({ streamId: id })) {
    next(new HttpError({
      status: 403,
      message: 'The stream is decoded now',
    }));

    return;
  }

  next();
}
