const child_process = require('child_process');
const HttpError = require('../error');

module.exports = ({ path, originalFile, targetFile }) => {
  const promise = new Promise((resolve, reject) => {

    const command = `ffmpeg -i ${path}${originalFile} -r 25 -vcodec libx264 -acodec aac -strict experimental ${path}${targetFile}`;

    child_process.exec(command, (error) => {
      if (error) {
        const httpError = new HttpError({
          status: 500,
          message: error.stack,
        });

        reject(httpError);
      }

      resolve();
    });
  });

  return promise;
};
