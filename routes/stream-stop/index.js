const getRequestData = require('../stream/get-request-data');
const HttpError = require('../../error');

module.exports = (emitter, streams, req, res, next) => {
  const id = req.params.id;
  let streamId = streams[`${id}`];

  if (!streamId) {
    const httpError = new HttpError({
        status: 403,
        message: 'Stop the impossible. stream not found.',
      })
      next(httpError);
      return;
  }


  // получить данные из request
  getRequestData({ req })
    .then((data) => {
      // Добавить данные в stream
      return streamId.stopStream({ data });
    })
    .then(() => {
      console.log('stop stream');
      res.json({});
    })
    .catch((e) => {
      streamId.destroy();
      next(e);
    });
};
