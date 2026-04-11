class AppError extends Error {
  constructor(errorCode, message, statusCode) {
    super(message);
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    // Captura el stack trace excluyendo el constructor de esta clase
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
