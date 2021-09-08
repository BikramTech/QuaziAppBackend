const jwt = require('jsonwebtoken')
const { auth } = require('../config/appConfig')

module.exports = (req, res, next) => {
  const token = req.header('x-auth-token')
  if (!token)
    return res.status(401).send({
      status_code: 2,
      message: 'Access Denied: No tokens provided',
      result: []
    })

  try {
    const decoded = jwt.verify(token, auth.jwt_secret)
    req.verify = decoded
    next()
  } catch (err) {
    res
      .status(400)
      .send({ status_code: 3, message: 'Invalid Token', result: [] })
  }
}
