/**
 * asyncHandler
 * Wraps an async route handler so rejected promises are forwarded to
 * Express's error middleware automatically, instead of needing a
 * try/catch in every single controller function.
 */
export default function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
