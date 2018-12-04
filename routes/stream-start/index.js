const removeAllDataStream = require('../../libs/remove-all-data-stream');
const getRequestData = require('../../libs/get-request-data');
const StreamId = require('./stream-id');

module.exports = (emitter, streams, req, res, next) => {
  const id = req.params.id;
  let streamId = streams[`${id}`];

  removeAllDataStream({ streamId: id })
    .then(() => {

      streamId = new StreamId({
        emitter,
        id,
        streams,
      });
      streams[`${id}`] = streamId;

      return getRequestData({ req });
    })
    .then((data) => {
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
