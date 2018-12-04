const config = require('../../config');
const logger = require('../../libs/log');
const removeDirectory = require('../../libs/remove-directiory');

module.exports = (decoder, req, res, next) => {
  const id = req.params.id;
  const originaFile = `${res.locals.streamDB.webm[0]}.webm`;

  const fileName = req.body.fileName;
  const streamDB = res.locals.streamDB;

  try {
    decoder.add({
      streamId: id,
      originaFile,
      targetFile: `${fileName}.mp4`,
    })
      .then(() => {
        removeDirectory({ path: `${config.get('videoPath')}/${id}/${originaFile}`});
      })
      .then(() => {
        streamDB.webm = [];
        streamDB.mp4 = fileName;
        return streamDB.save();
      })
      .catch((e) => {
        logger.error(e.message);
        streamDB.isDecode = false;
        streamDB.save();
      });

    res.json({});
  } catch (e) {

    next(e);
  }
};
