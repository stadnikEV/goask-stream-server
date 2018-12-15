const config = require('../../config');
const logger = require('../../libs/log');
const removeDirectory = require('../../libs/remove-directiory');

module.exports = (decoder, req, res, next) => {
  const id = req.params.id;
  const originalFile = res.locals.streamDB.originVideo[0];
  const fileName = `${req.body.fileName}.mp4`;
  const streamDB = res.locals.streamDB;

  try {
    decoder.add({
      streamId: id,
      originalFile,
      targetFile: fileName,
    })
      .then(() => {
        removeDirectory({ path: `${config.get('videoPath')}/${id}/${originalFile}`});
      })
      .then(() => {
        streamDB.originVideo = [];
        streamDB.decodedVideo = fileName;
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
