module.exports = ({ wstream, data }) => {
  const promise = new Promise((resolve, reject) => {

    wstream.on('finish', () => {
      resolve();
    });

    wstream.on('error', (e) => {
      reject(e);
    });

    if (data) {
      wstream.end(data);
      return;
    }

    wstream.end();
  });

  return promise;
};
