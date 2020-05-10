import { BindingKey } from "@loopback/context";
import { TokenService, UserService } from "@loopback/authentication";
import { PasswordHasher } from "./services/hash.password.bcryptjs";
import { User } from "./models";
import { Credentials } from "./repositories/user.repository";
import { EmailManager } from './services/email.service';

export namespace TokenServiceConstants {
  export const TOKEN_SECRET_VALUE = 'myjwtDctrClndrs3cr3t';
  export const TOKEN_EXPIRES_IN_VALUE = '2592000';
  export const VERIFY_TOKEN_SECRET_VALUE = 'V3RiFys3cr3t';
  export const VERIFY_TOKEN_EXPIRES_IN_VALUE = '1800';
}

export namespace EmailManagerBindings {
  export const SEND_MAIL = BindingKey.create<EmailManager>('services.email.send');
}

export namespace EmailServiceConstants {
  export const EMAIL_CONFIG = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'wolfpackteamapps@gmail.com',
      pass: '1234@Wolf.'
    }
  }
}

export namespace DataSourceName {
  export const DATA_SOURCE_NAME = 'datasources.mongo';
}

export namespace BaseUrls {
  export const UI_Base_Url = 'https://omnicali-demo.web.app';
}

export namespace TokenServiceBindings {

  export const TOKEN_SECRET = BindingKey.create<string>(
    'authentication.jwt.secret',
  );
  export const TOKEN_EXPIRES_IN = BindingKey.create<string>(
    'authentication.jwt.expires.in.seconds',
  );
  export const VERIFY_TOKEN_SECRET_VALUE = BindingKey.create<string>(
    'authentication.jwt.verify.secret',
  );
  export const VERIFY_TOKEN_EXPIRES_IN_VALUE = BindingKey.create<string>(
    'authentication.jwt.verify.expires.in.seconds',
  );
  export const TOKEN_SERVICE = BindingKey.create<TokenService>(
    'services.authentication.jwt.tokenservice',
  );
}

export namespace PasswordHasherBindings {
  export const PASSWORD_HASHER = BindingKey.create<PasswordHasher>(
    'services.hasher',
  );
  export const ROUNDS = BindingKey.create<number>('services.hasher.round');
}

export namespace UserServiceBindings {
  export const USER_SERVICE = BindingKey.create<UserService<User, Credentials>>(
    'services.user.service',
  );
}
