class ApiError extends Error {
  constructor(message, status = 500, payload = {}) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.payload = payload;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

class NotFoundError extends ApiError {
  constructor(message = "Not Found", payload = {}) {
    super(message, 404, payload);
  }
}

class ConflictError extends ApiError {
  constructor(message = "ConditionalCheckFailed", payload = {}) {
    super(message, 409, payload);
  }
}

class BadRequestError extends ApiError {
  constructor(message = "Bad Request", payload = {}) {
    super(message, 400, payload);
  }
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  const payload = err.payload || {};
  res.status(status).json({ message, ...payload });
}

function withLatency(min = 150, max = 400) {
  return function latencyMiddleware(req, res, next) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    setTimeout(next, delay);
  };
}

module.exports = {
  ApiError,
  NotFoundError,
  ConflictError,
  BadRequestError,
  errorHandler,
  withLatency
};
