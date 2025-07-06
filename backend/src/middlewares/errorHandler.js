// backend/src/middleware/errorHandler.js
export default function errorHandler(err, _req, res, _next) {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
}
