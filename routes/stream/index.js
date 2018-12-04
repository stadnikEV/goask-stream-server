const getRequestData = require('../../libs/get-request-data');

module.exports = (streams, req, res, next) => {
  const id = req.params.id;
  let streamId = streams[`${id}`];

  getRequestData({ req })
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
