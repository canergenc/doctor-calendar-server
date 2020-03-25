import { inject, BindingScope, bind } from '@loopback/core';
import { juggler } from '@loopback/repository';

const nodemailer = require('nodemailer');
let set: any;

@bind({ scope: BindingScope.TRANSIENT })
export class EmailService {
  constructor(
    @inject('datasources.mail') dataSource: juggler.DataSource
  ) {
    set = dataSource;
  }

  public async SendMail() {

    //console.log(set.settings);
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'wolfpackteamapps@gmail.com',
        pass: '1234@wolf'
      }
    });
    try {
      await transporter.sendMail({
        from: "wolfpackteamapps@gmail.com",
        to: "canergenc93@gmail.com",
        subject: "Sand Calendar Info Message",
        html: "Welcome to Sand Calendar! :)"
      });
    } catch (error) {
      console.log(error)
    }


  }

}
