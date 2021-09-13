const nodemailer = require('nodemailer')
const { mail } = require('../../config/appConfig')

class MailService {
  static mailTransporter () {
    return nodemailer.createTransport({
      host: 'smtpout.secureserver.net',
      tls: {
        ciphers: 'SSLv3'
      },
      requireTLS: true,
      port: 465,
      debug: true,
      secure: true,
      secureConnection: false,
      auth: {
        user: mail.mail_domain_userName,
        pass: mail.mail_domain_password
      }
    })
  }

  static async sendMail (to = '', subject = '', text = '') {
    try {
      const from = mail.mail_from
      text = text.toString()
      return MailService.mailTransporter().sendMail({ from, to, subject, text })
    } catch (err) {
      console.log(err)
    }
  }
}

module.exports = MailService
