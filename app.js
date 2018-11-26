const express = require('express');
const http = require('http');
const HttpError = require('./error');
const config = require('./config');
const morgan = require('morgan');
const logger = require('./libs/log'); // логирование в консоль
const Emitter = require("events");

const emitter = new Emitter();
emitter.setMaxListeners(1000);

const streams = {};

const app = express();
app.set('port', config.get('port'));

app.use(morgan('tiny'));

require('./routes')({ app, emitter, streams });


/*
*   перехват ошибок
*/

app.use((err, req, res, next) => {
  if (err instanceof HttpError) {
    res.status(err.status);
    res.json(err);
    return;
  }
  logger.error(err.stack);

  res.status(500);
  res.json(new HttpError({
    status: 500,
  }));
});

http.createServer(app).listen(config.get('port'), () => {
  logger.info('Express server listening on port ' + config.get('port'));
});
