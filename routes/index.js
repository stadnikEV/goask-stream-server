module.exports = ({ app, emitter, streams }) => {
  app.post('/stream/:id', require('./stream').bind(null, emitter, streams));
  app.post('/stream-stop/:id', require('./stream-stop').bind(null, emitter, streams));
}
