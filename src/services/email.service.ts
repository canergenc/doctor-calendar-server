import { BindingScope, bind } from '@loopback/core';
import { EmailServiceConstants } from '../keys';
import { Email } from '../models/email.model';
import { MailType } from '../enums/mail-type.enum';
import { repository } from '@loopback/repository';
import { MailTemplateRepository } from '../repositories/mail-template.repository';

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

  constructor(
    @repository(MailTemplateRepository) private mailTemplateRepository: MailTemplateRepository
  ) { }

  async sendMail(mailObj: Email): Promise<object> {

    const transporter = await nodemailer.createTransport(EmailServiceConstants.EMAIL_CONFIG);
    return await transporter.sendMail(mailObj);
  }

  async setMailModel(fullName: string, to: string, mailType: MailType, url?: string): Promise<Email> {

    const emailModel = new Email();
    emailModel.to = to;
    emailModel.from = EmailServiceConstants.EMAIL_CONFIG.auth.user;

    switch (mailType) {
      case MailType.Register:
        emailModel.subject = "Sayın " + fullName + " Omnicali Uygulamasına Hoşgeldiniz!";
        emailModel.html = await this.getMailTemplate(MailType.Register, url || "", fullName);
        break;
      case MailType.PasswordReset:
        emailModel.subject = "Omnicali Hesap Parola Sıfırlama İsteği";
        emailModel.html = await this.getMailTemplate(MailType.PasswordReset, url || "", fullName);
        break;
      case MailType.PasswordUpdate:
        emailModel.subject = "Omnicali Hesap Parolanız Değiştirildi";
        emailModel.html = await this.getMailTemplate(MailType.PasswordUpdate, url || "", fullName);
        break;
    }
    return emailModel;

  }

  async getMailTemplate(mailType: MailType, url: string, name: string): Promise<string> {
    let html = "";
    let templateResult = undefined;
    switch (mailType) {
      case MailType.PasswordReset:
        templateResult = await this.mailTemplateRepository.findOne({ where: { mailType: MailType.PasswordReset } });
        if (!templateResult) break;
        templateResult.html = templateResult.html
          .replace("$user", name)
          .replace("$url", url)
        html = templateResult.html
        break;
      case MailType.Register:
        templateResult = await this.mailTemplateRepository.findOne({ where: { mailType: MailType.Register } });
        if (!templateResult) break;
        templateResult.html = templateResult.html
          .replace("$user", name)
          .replace("$url", url)
        html = templateResult.html
        break;
      case MailType.PasswordUpdate:
        templateResult = await this.mailTemplateRepository.findOne({ where: { mailType: MailType.PasswordUpdate } });
        if (!templateResult) break;
        templateResult.html = templateResult.html
          .replace("$user", name)
        html = templateResult.html
        break;
    }
    return html;
  }



}
