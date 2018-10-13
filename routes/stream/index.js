const getRequestData = require('./get-request-data');

module.exports = (emitter, streams, req, res, next) => {
  const id = req.params.id;
  let streamId = streams[`${id}`];

  // создать объект stream
  if (!streamId) {
    const StreamId = require('./stream-id');
    streamId = new StreamId({
      emitter,
      id,
      streams,
    });
    streams[`${id}`] = streamId;
  }

  // получить данные из request
  getRequestData({ req })
    .then((data) => {
      // Добавить данные в stream
      return streamId.addToStream({ data, streams: streamId });
    })
    .then(() => {
      res.json({});
    })
    .catch((e) => {
      next(e);
    });
};
