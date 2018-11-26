const getRequestData = require('./get-request-data');
const StreamId = require('./stream-id');

module.exports = (emitter, streams, req, res, next) => {
  const id = req.params.id;
  let streamId = streams[`${id}`];

  // создать объект stream
  if (!streamId) {
    console.log('создан новый объект streamId');
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
      return streamId.addToStream({ data });
    })
    .then(() => {
      res.json({});
    })
    .catch((e) => {
      streamId.destroy();
      next(e);
    });
};
