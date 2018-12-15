module.exports = ({ app, decoder, emitter, streams }) => {
  app.get('/status-video', require('./get-status-video').bind(null, decoder, streams));

  app.delete('/stream/:id', require('./delete-stream'));

  app.post('/stream-db/:id', require('./stream-db'));

  app.post('/stream/:id/start',
    require('../middleware/stream-is-not-exists').bind(null, streams),
    require('../middleware/stream-is-not-decoded').bind(null, decoder),
    require('./stream-start').bind(null, emitter, streams));

  app.post('/stream/:id',
    require('../middleware/stream-is-exists').bind(null, streams),
    require('./stream').bind(null, streams));

  app.post('/stream/:id/stop',
    require('../middleware/stream-is-exists').bind(null, streams),
    require('./stream-stop').bind(null, decoder, streams));

  app.post('/decoder/:id',
    require('../middleware/stream-is-not-exists').bind(null, streams),
    require('../middleware/files-is-exists').bind(null, streams),
    require('./decoder').bind(null, decoder));
}
