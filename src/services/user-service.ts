import { UserService } from "@loopback/authentication";
import { User, UserInfoOutputModel, ResetPassword } from "../models";
import { Credentials, UserRepository } from "../repositories/user.repository";
import { HttpErrors } from "@loopback/rest";
import { repository } from "@loopback/repository";
import { PasswordHasherBindings, TokenServiceBindings, EmailManagerBindings } from '../keys';
import { PasswordHasher } from "./hash.password.bcryptjs";
import { inject } from "@loopback/context";
import { UserProfile, securityId } from '@loopback/security';
import { UserCredentialsRepository } from "../repositories/user-credentials.repository";
import { UserGroupRepository, UserRoleRepository, GroupRepository, RoleRepository, CalendarRepository } from "../repositories";
import { promisify } from "util";
import { EmailManager } from './email.service';
import { MailType } from '../enums/mailType.enum';
import { RoleType } from '../enums/roleType.enum';
import { NewUserRequest } from '../controllers';
import isemail from 'isemail';

const jwt = require('jsonwebtoken');
const verifyAsync = promisify(jwt.verify);
const signAsync = promisify(jwt.sign);

const invalidCredentialsError = 'Geçersiz email veya parola!';

export class MyUserService implements UserService<User, Credentials> {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SECRET) private jwtSecret: string,
    @inject(TokenServiceBindings.VERIFY_TOKEN_SECRET_VALUE) private jwtVerifySecret: string,
    @inject(TokenServiceBindings.VERIFY_TOKEN_EXPIRES_IN_VALUE) private jwtVerifyExpiresIn: string,
    @repository(UserRepository) private userRepository: UserRepository,
    @repository(UserGroupRepository) private userGroupRepository: UserGroupRepository,
    @repository(GroupRepository) private groupRepository: GroupRepository,
    @repository(CalendarRepository) private calendarRepository: CalendarRepository,
    @repository(UserRoleRepository) private userRoleRepository: UserRoleRepository,
    @repository(UserCredentialsRepository) private userCredentialsRepository: UserCredentialsRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER) private passwordHasher: PasswordHasher,
    @inject(EmailManagerBindings.SEND_MAIL) private emailManager: EmailManager,
  ) { }

  /** İat and Exp times result */
  async decodeToken(token: string, customSecretKey?: string): Promise<{
    decodeModel: {
      userId: string,
      iat: number,
      exp: number
    }
  }> {
    if (!token) { throw new HttpErrors.BadRequest("Token boş gönderilemez!") }
    try {
      const result = await verifyAsync(token, customSecretKey ? customSecretKey : this.jwtSecret);
      return {
        decodeModel: {
          userId: result?.id,
          iat: result?.iat,
          exp: result?.exp
        }
      };
    } catch (error) {
      throw new HttpErrors.Unauthorized(
        `Geçersiz Token : ${error.message}`,
      );
    }

  }

  async generateVerifyToken(value: string): Promise<string> {
    if (!value) return "";
    let token: string;
    const myModel = { [securityId]: value, id: value };
    try {
      token = await signAsync(myModel, this.jwtVerifySecret, {
        expiresIn: Number(this.jwtVerifyExpiresIn),
      });
    } catch (error) {
      throw new HttpErrors.Unauthorized(`Token oluşturulamadı : ${error}`);
    }
    return token;
  }

  async verifyEmail(key: string): Promise<boolean> {
    if (!key) {
      throw new HttpErrors.BadRequest("Hatalı istek!");
    }
    const res = await this.decodeToken(key, this.jwtVerifySecret);
    const foundCredentialUserCount = await this.userCredentialsRepository.updateAll({ emailVerified: true }, { userId: { like: res?.decodeModel?.userId } });
    return foundCredentialUserCount.count > 0 ? true : false;
  }

  async forgot(email: string): Promise<boolean> {
    const foundUser = await this.userRepository.findOne({ where: { email: { like: email } } });
    if (!foundUser) {
      throw new HttpErrors.BadRequest("Bu adrese ait kayıtlı hesap bulunamadı!");
    }
    const token = await this.generateVerifyToken(foundUser.id);
    if (!token) { throw new HttpErrors.BadRequest("Bir hata oluştu! Lütfen sistem yöneticisine danışınız!"); }
    await this.sendMailForgotPassword(email, foundUser.fullName, token);
    return true;
  }

  async resetPassword(key: string, resetPassword: ResetPassword): Promise<boolean> {
    if (!key) {
      throw new HttpErrors.BadRequest("Hatalı istek!");
    }
    const res = await this.decodeToken(key, this.jwtVerifySecret);
    if (res.decodeModel.userId) {
      const foundUser = await this.userRepository.findById(res.decodeModel.userId);
      if (foundUser) {
        await this.passwordUpdate(res.decodeModel.userId, resetPassword.password);
      }
      else {
        throw new HttpErrors.BadRequest("Kullancı bulunamadı! Lütfen sistem yöneticisine danışınız!")
      }
    }
    return true;
  }

  async updateById(id: string, user: NewUserRequest, currentUserProfile: UserProfile): Promise<void> {

    if (!currentUserProfile.roles?.includes(RoleType.Admin)) {
      delete user.roles;
    }

    user.updatedDate = new Date();
    user.updatedUserId = currentUserProfile[securityId];

    if (user.email) {
      await this.validateEmail(id, user.email);
    }

    if (user.password) {
      /**Password Update */
      await this.passwordUpdate(id, user.password)
    }

    await this.userRepository.updateById(id, user);
  }

  private async passwordUpdate(userId: string, password: string): Promise<void> {
    if (password.length >= 8 && password.length <= 16) {
      const foundUserCredential = await this.userCredentialsRepository.findOne({ where: { userId: { like: userId } } });
      if (foundUserCredential) {
        /**Compare Password */
        await this.comparePassword(password, foundUserCredential.password);

        // encrypt the password
        const hashNewPassword = await this.passwordHasher.hashPassword(
          password,
        );
        if (hashNewPassword) {
          await this.userCredentialsRepository.updateAll({ password: hashNewPassword }, { userId: userId });
        } else {
          throw new HttpErrors.BadRequest("Parola kayıt edilemedi! Lütfen sistem yöneticisine danışınız!");
        }
      } else {
        throw new HttpErrors.BadRequest("Kullanıcı bulunamadı!");
      }
    } else {
      throw new HttpErrors.BadRequest("Parola minimum 8 karakter uzunluğunda olmalı!");
    }
  }

  async verifyCredentials(credentials: Credentials): Promise<User> {

    const foundUser = await this.userRepository.findOne({
      where: { email: credentials.email },
    });

    if (!foundUser) {
      throw new HttpErrors.BadRequest(invalidCredentialsError);
    }

    // if (!foundUser.isActive) {
    //   throw new HttpErrors.BadRequest("Kullanıcı aktif hale getirilmelidir. Lütfen sistem yöneticisine danışınız!");
    // }
    const credentialsFound = await this.userCredentialsRepository.findOne({ where: { userId: { like: foundUser.id } } });

    if (!credentialsFound) {
      throw new HttpErrors.BadRequest(invalidCredentialsError);
    }

    // if (!credentialsFound.emailVerified) {
    //   throw new HttpErrors.BadRequest("Lütfen email doğrulaması yapınız!");
    // }

    /**Compare Password */
    await this.comparePassword(credentials.password, credentialsFound.password);


    return foundUser;
  }

  async comparePassword(providedPass: string, storedPass: string): Promise<boolean> {
    const passwordMatched = await this.passwordHasher.comparePassword(
      providedPass,
      storedPass,
    );
    if (!passwordMatched) {
      throw new HttpErrors.BadRequest(invalidCredentialsError);
    }
    return passwordMatched;
  }

  async validateEmail(userId: string, email: string): Promise<void> {
    // Validate Email
    if (!isemail.validate(email)) {
      throw new HttpErrors.BadRequest('Hatalı email');
    }
    const foundUser = await this.userRepository.findOne({ where: { id: userId } });
    if (foundUser?.email != email) {
      const foundUserEmail = await this.userRepository.findEmail(email);
      if (foundUserEmail)
        throw new HttpErrors.BadRequest("Bu email daha önce kayıt edilmiş!");
    }
  }

  async reVerify(email: string): Promise<boolean> {
    const foundUser = await this.userRepository.findOne({ where: { email: { like: email } } });
    if (!foundUser) { throw new HttpErrors.NotFound("Böyle bir hesap bulunamadı") }
    const foundUserCredential = await this.userCredentialsRepository.findOne({ where: { userId: { like: foundUser.id }, emailVerified: true } });
    if (foundUserCredential) { throw new HttpErrors.NotFound("Daha önce hesap doğrulaması yapıldı!") }
    try {
      const token = await this.generateVerifyToken(foundUser.id);
      await this.sendMailRegisterUser(foundUser.id, foundUser.fullName, token);
      return true;
    } catch (error) {
      throw new HttpErrors.NotFound(error);
    }
  }

  async sendMailForgotPassword(email: string, fullName: string, token: string): Promise<void> {

    const url = `http://localhost:3000/users/resetPassword/${token}`;

    await this.emailManager.setMailModel(fullName, email, MailType.PasswordReset, url).then((response) => {

      this.emailManager.sendMail(response).then((res) => {
        console.log(res);
        //return { message: `${email} adresine aktivasyon maili gönderilmiştir. Lütfen mailinizi kontrol ediniz.` };
      }).catch((error) => {
        console.log(error);
        //throw new HttpErrors.UnprocessableEntity(`${email} adresine mail gönderiminde hata oluştu! Lütfen sistem yöneticisine danışınız!`);
      });
    }

    )
  }

  async sendMailRegisterUser(email: string, fullName: string, token: string): Promise<void> {

    const url = `http://localhost:3000/users/verification/${token}`;

    await this.emailManager.setMailModel(fullName, email, MailType.Register, url).then((response) => {

      this.emailManager.sendMail(response).then((res) => {
        console.log(res);
        //return { message: `${email} adresine aktivasyon maili gönderilmiştir. Lütfen mailinizi kontrol ediniz.` };
      }).catch((error) => {
        console.log(error);
        //throw new HttpErrors.UnprocessableEntity(`${email} adresine mail gönderiminde hata oluştu! Lütfen sistem yöneticisine danışınız!`);
      });
    }

    )

  }

  async printCurrentUser(currentuser: UserProfile): Promise<UserInfoOutputModel> {
    // const myToken = await this.generateVerifyToken('5e81d16b63226a009965dd47');

    // await this.sendMailRegisterUser(
    //   'canergenc93@gmail.com',
    //   'Caner Genç',
    //   myToken)

    const userInfoOutputModel = new UserInfoOutputModel();

    /*User Model*/
    userInfoOutputModel.user = await this.userRepository.findOne({ where: { id: currentuser.id } }) ?? new User;

    /*Groups List */
    const userGroupList = await this.userGroupRepository.find({ where: { userId: { like: currentuser.id } } });
    userInfoOutputModel.groups = [];
    for (const item of userGroupList) {
      const groupModel = await this.groupRepository.findById(item.groupId);
      if (groupModel) {
        userInfoOutputModel.groups.push(groupModel)
      }
    }

    /*Role List */
    userInfoOutputModel.roles = [];

    /*Geçici kodlama */
    userInfoOutputModel.roles = userInfoOutputModel.user.roles;

    //Orjinal kısım
    // await this.userRoleRepository.find({ where: { userId: { like: currentuser.id } } }).then((result) => {
    //   result.forEach((item) => {
    //     this.roleRepository.findOne({ where: { id: item.roleId } }).then((roleItem) => {
    //       if (roleItem) userInfoOutputModel.roles.push(roleItem);
    //     });
    //   })
    // });
    return userInfoOutputModel;
  }

  convertToUserProfile(user: User): UserProfile {
    const userProfile = {
      [securityId]: user.id,
      name: user.fullName,
      id: user.id,
      role: user.roles
    }
    return userProfile;
  }

  async deleteById(userId: typeof User.prototype.id): Promise<void> {

    await this.userRepository.updateAll({ isDeleted: true, updatedDate: new Date(), updatedUserId: userId }, { id: userId }).then(async () => {

      //#region User Credential Delete
      await this.userCredentialsRepository.updateAll({ isDeleted: true, updatedDate: new Date(), updatedUserId: userId }, { userId: { like: userId } });
      //#endregion

      //#region User-Group Delete
      await this.userGroupRepository.updateAll({ isDeleted: true, updatedDate: new Date(), updatedUserId: userId }, { userId: { like: userId } });
      //#endregion

      //#region User-Role Delete
      await this.userRoleRepository.updateAll({ isDeleted: true, updatedDate: new Date(), updatedUserId: userId }, { userId: { like: userId } });
      //#endregion

      //#region Calendar Delete
      await this.calendarRepository.updateAll({ isDeleted: true, updatedDate: new Date(), updatedUserId: userId }, { userId: { like: userId } });
      //#endregion

    }).catch(ex => {
      throw new HttpErrors.NotFound(ex);
    });

  }

}

