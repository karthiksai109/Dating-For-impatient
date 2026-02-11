/**
 * Centralized error response handler
 * @param {Object} res - Express response object
 * @param {Error} err - Error object
 * @param {number} statusCode - HTTP status code (default 500)
 */
function handleError(res, err, statusCode = 500) {
  console.error(`[ERROR] ${err.message}`);
  return res.status(statusCode).send({
    status: false,
    message: err.message || "internal server error"
  });
}

module.exports = handleError;
