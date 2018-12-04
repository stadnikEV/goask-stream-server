const removeAllDataStream = require('../../libs/remove-all-data-stream');

module.exports = (req, res, next) => {
  const streamId = req.params.id;

  removeAllDataStream({ streamId })
    .then(() => {
      res.json({});
    })
    .catch((e) => {
      next(e);
    });
};
