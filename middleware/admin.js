const crypto = require('crypto')

module.exports = function requireAdmin(req, res, next) {
  const expected = process.env.ADMIN_ACCESS_KEY
  const supplied = req.get('x-admin-key') || ''
  if (!expected) {
    return res.status(503).send({ message: 'Admin access is not configured on the server.' })
  }

  const expectedBuffer = Buffer.from(expected)
  const suppliedBuffer = Buffer.from(supplied)
  const valid = expectedBuffer.length === suppliedBuffer.length && crypto.timingSafeEqual(expectedBuffer, suppliedBuffer)
  if (!valid) return res.status(401).send({ message: 'Invalid admin access key.' })
  res.set('Cache-Control', 'no-store')
  return next()
}