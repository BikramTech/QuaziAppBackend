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
    hostUrl: process.env.DB_HOST_URL || 'localhost'
  },
  winiston: {
    logpath: '/iLrnLogs/logs/'
  },
  auth: {
    jwt_secret: process.env.jwt_secret,
    jwt_expires_in: process.env.jwt_expires_in || '1d'
  },
  mail: {
    mail_domain_name: process.env.MAIL_SERVICE_DOMAIN,
    mail_domain_userName: process.env.MAIL_SERVICE_USERNAME,
    mail_domain_password: process.env.MAIL_SERVICE_PASSWORD,
    mail_from: process.env.MAIL_SERVICE_FROM
  },
  encryption: {
    secret_key: process.env.ENCRYPTION_SECRET_KEY
  },
  twilio: {
    account_sid: process.env.TWILIO_ACCOUNT_SID,
    account_auth_token: process.env.TWILIO_AUTH_TOKEN,
    message_service_id: process.env.MESSAGE_SERVICE_ID
  },
  stripe:{
    publishable_key: process.env.STRIPE_PUBLISHABLE_KEY,
    secret_key: process.env.STRIPE_SECRET_KEY,
    success_url:process.env.STRIPE_SUCCESS_URL,
    cancel_url:process.env.STRIPE_CANCEL_URL,
    currency: process.env.STRIPE_CURRENCY
  }
}
