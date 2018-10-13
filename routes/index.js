module.exports = ({ app, emitter, streams }) => {
  app.post('/stream/:id', require('./stream').bind(null, emitter, streams));
  app.post('/streamEnd/:id', require('./stream-end').bind(null, emitter, streams));
  app.post('/getStream/:id', require('./get-stream').bind(null, emitter, streams));
}
