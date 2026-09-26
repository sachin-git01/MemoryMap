// 404 Not Found Middleware
export const notFound = (req, res, next) => {
  const error = new Error(`Resource not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global Error Handler Middleware
// Never leaks stack traces, internal database details, or file paths
export const errorHandler = (err, req, res, _next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  // Log full error details securely server-side only
  console.error(`[Server Error] ${req.method} ${req.originalUrl}:`, err.stack || err.message);

  // Mongoose validation or duplicate key errors
  let message = err.message || 'Something went wrong';
  if (err.name === 'CastError') {
    message = 'Resource not found or invalid identifier';
  } else if (err.code === 11000) {
    message = 'Duplicate field value entered';
  } else if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map(val => val.message).join(', ');
  } else if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    // Strict production generic message
    message = 'Something went wrong on the server';
  }

  res.status(statusCode).json({
    success: false,
    message
  });
};
