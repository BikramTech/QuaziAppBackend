const nodemailer = require('nodemailer');
const { mail } =  require('../../config/appConfig');

class MailService {
  
  static mailTransporter ()
     {
       return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        service: mail.mail_domain_name,
        secure: false,
        auth: {
          user: mail.mail_domain_userName,
          pass: mail.mail_domain_password
        }
      })
     } 
  
    static async sendMail(to='', subject='', text='') {

      const from = mail.mail_domain_userName;
      text = text.toString();
      return MailService.mailTransporter().sendMail({ from, to, subject, text});
    }
  }
  
  module.exports = MailService;