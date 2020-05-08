import { BindingScope, bind } from '@loopback/core';
import { EmailServiceConstants } from '../keys';
import { Email } from '../models/email.model';
import { MailType } from '../enums/mailType.enum';

const nodemailer = require('nodemailer');
let subBodyModel = {
  subject: "",
  body: ""
}
export interface EmailManager<T = Object> {
  sendMail(mailObj: Email): Promise<T>;
  setMailModel(fullName: string, to: string, mailType: MailType, url?: string): Promise<Email>
}

@bind({ scope: BindingScope.TRANSIENT })
export class EmailService {

  constructor() { }

  async sendMail(mailObj: Email): Promise<object> {

    const transporter = nodemailer.createTransport(EmailServiceConstants.EMAIL_CONFIG);
    return await transporter.sendMail(mailObj);
    // {
    //   from: "wolfpackteamapps@gmail.com",
    //   to: "canergenc93@gmail.com",
    //   subject: "Sand Calendar Info Message",
    //   html: "Welcome to Sand Calendar! :)"
    // }
  }

  async setMailModel(fullName: string, to: string, mailType: MailType, url?: string): Promise<Email> {

    const emailModel = new Email();
    emailModel.to = to;
    emailModel.from = EmailServiceConstants.EMAIL_CONFIG.auth.user;

    switch (mailType) {
      case MailType.Register:
        emailModel.subject = "Sayın " + fullName + " Omnicali Uygulamasına Hoşgeldiniz!";
        emailModel.html = "Hesabınızı aktifleştirmek için lütfen aktivasyon linkine tıklayınız. " + url;
        break;
      case MailType.PasswordReset:
        emailModel.subject = "Omnicali Hesap Parola Sıfırlama";
        emailModel.html = "Hesabınızın parolasını sıfırlamak için lütfen parola sıfırlama linkine tıklayınız. "
        break;
    }
    return emailModel;

  }



}
