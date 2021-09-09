require('dotenv').config()

module.exports = {
  app: {
    port: process.env.DEV_APP_PORT || 3000,
    appName: process.env.APP_NAME || 'iLrn',
    env: process.env.NODE_ENV || 'development'
  },
  db: {
    port: process.env.DB_PORT || 27017,
    database: process.env.DB_NAME || 'Quazi',
    password: process.env.DB_PASS || 'password',
    username: process.env.DB_USER || 'mongodb',
    host: process.env.DB_HOST || 'localhost'
  },
  winiston: {
    logpath: '/iLrnLogs/logs/'
  },
  auth: {
    jwt_secret: process.env.jwt_secret,
    jwt_expiresin: process.env.JWT_EXPIRES_IN || '1d'
  },
  mail: {
    mail_domain_name: process.env.MAIL_SERVICE_DOMAIN,
    mail_domain_userName: process.env.MAIL_SERVICE_USERNAME,
    mail_domain_password: process.env.MAIL_SERVICE_PASSWORD,
    mail_from: process.env.MAIL_SERVICE_FROM
  }
}
