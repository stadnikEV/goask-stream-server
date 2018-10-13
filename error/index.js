var http = require('http');

class HttpError extends Error {
  constructor({ message, status }) {
    super();
    this.name = this.constructor.name;
    this.status = status;
    this.message = message || http.STATUS_CODES[status] || 'Error';
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = HttpError;
