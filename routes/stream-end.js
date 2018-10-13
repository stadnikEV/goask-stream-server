const getRequestData = require('./stream/get-request-data');
const HttpError = require('../error');

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
  streamId.stopStrem();

  // получить данные из request
  getRequestData({ req })
    .then((data) => {
      // Добавить данные в stream
      return streamId.addToStream({ data });
    })
    .then(() => {
      res.json({});
      const listenersCount = emitter.listeners(`cluster-${id}`).length;
      if (listenersCount) {
        streamId.emitCluster();
        return;
      }

      delete streams[`${id}`];
    })
    .catch((e) => {
      next(e);
    });
};
