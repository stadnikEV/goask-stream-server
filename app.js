const express = require('express');
const http = require('http');
const HttpError = require('./error');
const config = require('./config');
const morgan = require('morgan');
const logger = require('./libs/log'); // логирование в консоль
const Emitter = require("events");
const headers = require('./middleware/headers');


var fs = require('fs');


const emitter = new Emitter();
emitter.setMaxListeners(1000);

const streams = {};

const app = express();
app.set('port', config.get('port'));

// app.use(morgan('tiny'));
app.use(headers);

require('./routes')({ app, emitter, streams });

setInterval(() => {
  console.log(process.memoryUsage().heapUsed);
}, 1000);
// app.get('/file/:id', function(req, res) {
//   var id = req.params.id;
//   const stream = streams[`${id}`];
//   if (stream) {
//     return;
//     res.status(403).end();
//   }
//   res.writeHead(200, {"Content-Type" : "video/webm"});
//   fs.createReadStream(`${id}.webm`).pipe(res);
// });
//
// app.get('/load/:id', function(req, res) {
//   var id = req.params.id;
//   const stream = streams[`${id}`];
//   if (fs.existsSync('./1.webm') && !stream) {
//     res.status(200).end();
//     return;
//   }
//   res.status(403).end();
// });
//
// app.get('/status/:id', function(req, res) {
//   var id = req.params.id;
//   const stream = streams[`${id}`];
//   if (!stream) {
//     res.status(200).end();
//     return;
//   }
//   res.status(403).end();
// });

app.get('/watch', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
  fs.createReadStream('index-client.html').pipe(res);
});

app.get('/stream', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
  fs.createReadStream('index.html').pipe(res);
});

app.get('/script-client.js', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/javascript; charset=utf8'});
  fs.createReadStream('script-client.js').pipe(res);
});

app.get('/script.js', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/javascript; charset=utf8'});
  fs.createReadStream('script.js').pipe(res);
});

/*
*   перехват ошибок
*/

app.use((err, req, res, next) => {
  let error = err;
  logger.error(error.stack);
  if (error instanceof HttpError) {
    res.status(error.status);
    res.json(error);
    return;
  }
  res.status(500);
  res.json(new HttpError({
    status: 500,
  }));
});



http.createServer(app).listen(config.get('port'), () => {
  logger.info('Express server listening on port ' + config.get('port'));
});
