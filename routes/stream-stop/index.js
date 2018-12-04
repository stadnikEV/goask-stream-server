const getRequestData = require('../../libs/get-request-data');

module.exports = (decoder, streams, req, res, next) => {
  const id = req.params.id;
  let streamId = streams[`${id}`];

  getRequestData({ req })
    .then((data) => {
      return streamId.stopStream({ data });
    })
    .then(() => {
      streamId.destroy();
      res.json({});
    })
    .catch((e) => {
      streamId.destroy();
      next(e);
    });
};
