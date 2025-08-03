// Global error handler middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      error: 'Duplicate entry',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Firebase auth errors
  if (err.code === 'auth/id-token-expired') {
    return res.status(401).json({ error: 'Authentication token expired' });
  }

  if (err.code === 'auth/id-token-revoked') {
    return res.status(401).json({ error: 'Authentication token revoked' });
  }

  if (err.code === 'auth/invalid-id-token') {
    return res.status(401).json({ error: 'Invalid authentication token' });
  }

  // Default error response
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
}; 