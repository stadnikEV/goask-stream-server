const express = require('express');
const http = require('http');
const HttpError = require('./error');
const config = require('./config');
const morgan = require('morgan');
const logger = require('./libs/log');
const bodyParser = require('body-parser');
const Emitter = require('events');
const Decoder = require('./libs/decoder');

const emitter = new Emitter();
emitter.setMaxListeners(1000);

const streams = {};

const app = express();
app.set('port', config.get('port'));

app.use(morgan('tiny'));
app.use(bodyParser.json());

const decoder = new Decoder({ emitter });

require('./routes')({ app, decoder, emitter, streams });

app.use((req, res) => {
  res.status(404);
  res.json(new HttpError({
    status: 404,
    message: 'Resource is not found',
  }));
});


/*
*   перехват ошибок
*/

app.use((err, req, res, next) => {
  if (err instanceof HttpError && err.status !== 500) {
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
