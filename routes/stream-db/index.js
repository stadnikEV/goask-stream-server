const addFileNameToDB = require('../../libs/add-file-name-to-db');

module.exports = (req, res, next) => {
  const id = req.params.id;
  const originalFile = req.body.originalFile;

  addFileNameToDB({ streamId: id, fileName: originalFile })
    .then(() => {
      res.json({});
    })
    .catch((e) => {
      next(e);
    });
};
