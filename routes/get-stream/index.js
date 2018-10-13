const HttpError = require('../../error');

module.exports = (emitter, streams, req, res, next) => {
  let httpError = null;
  if (req.headers['content-type'] !== 'application/json') {
    httpError = new HttpError({
      status: 403,
      message: 'The data is not JSON',
    });
    next(httpError);
    return;
  }

  const data = [];
  req.on('data', function(chunk) {
    data.push(chunk);
  }).on('end', () => {
    const string = data.toString('utf8');
    const reguestData = JSON.parse(string);

    const id = req.params.id;
    let streamId = streams[`${id}`];

    if (!streamId) {
      httpError = new HttpError({
        status: 403,
        message: 'stream not found',
      });
      next(httpError);
      return;
    }

    const sendCluster = (cluster) => {
      emitter.removeListener(`cluster-${id}`, sendCluster);
      if (cluster === null) {
        httpError = new HttpError({
          status: 403,
          message: 'drop stream',
        });
        next(httpError);
      }
      if (cluster) {
        res.end(cluster);
      }
      const listenersCount = emitter.listeners(`cluster-${id}`).length;
      if (streamId.isStop() && !listenersCount) {
        delete streams[`${id}`];
      }
    }


    if (reguestData.head) {

      if (streamId.head) {
        if (streamId.cluster) {
          const data = Buffer.concat([streamId.head, streamId.cluster]);

          res.end(data);
          return;
        }
        res.end(streamId.head);
        return;
      }
    }
    emitter.on(`cluster-${id}`, sendCluster);
  });
};
