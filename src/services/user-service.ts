import { UserService, TokenService } from "@loopback/authentication";
import { User, UserInfoOutputModel, ResetPassword } from "../models";
import { Credentials, UserRepository } from "../repositories/user.repository";
import { HttpErrors } from "@loopback/rest";
import { repository } from "@loopback/repository";
import { PasswordHasherBindings, TokenServiceBindings, EmailManagerBindings, BaseUrls } from '../keys';
import { PasswordHasher } from "./hash.password.bcryptjs";
import { inject } from "@loopback/context";
import { UserProfile, securityId } from '@loopback/security';
import { UserCredentialsRepository } from "../repositories/user-credentials.repository";
import { UserGroupRepository, UserRoleRepository, GroupRepository, RoleRepository, CalendarRepository, ErrorLogRepository } from "../repositories";
import { promisify } from "util";
import { EmailManager } from './email.service';
import { MailType } from '../enums/mail-type.enum';
import { RoleType } from '../enums/role-type.enum';
import { UpdateUserRequest } from '../controllers';
import isemail from 'isemail';
import { PlatformType } from '../enums/platform.enum';
import { Guid } from "guid-typescript";

const jwt = require('jsonwebtoken');
const verifyAsync = promisify(jwt.verify);
const signAsync = promisify(jwt.sign);

const invalidCredentialsError = 'Geçersiz email veya parola!';

export class MyUserService implements UserService<User, Credentials> {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE) private tokenService: TokenService,
    @inject(TokenServiceBindings.TOKEN_SECRET) private jwtSecret: string,
    @inject(TokenServiceBindings.VERIFY_TOKEN_SECRET_VALUE) private jwtVerifySecret: string,
    @inject(TokenServiceBindings.VERIFY_TOKEN_EXPIRES_IN_VALUE) private jwtVerifyExpiresIn: string,
    @repository(UserRepository) private userRepository: UserRepository,
    @repository(UserGroupRepository) private userGroupRepository: UserGroupRepository,
    @repository(GroupRepository) private groupRepository: GroupRepository,
    @repository(CalendarRepository) private calendarRepository: CalendarRepository,
    @repository(UserRoleRepository) private userRoleRepository: UserRoleRepository,
    @repository(ErrorLogRepository) private errorLogRepository: ErrorLogRepository,
    @repository(UserCredentialsRepository) private userCredentialsRepository: UserCredentialsRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER) private passwordHasher: PasswordHasher,
    @inject(EmailManagerBindings.SEND_MAIL) private emailManager: EmailManager,
  ) { }

  /** İat and Exp times result */
  async decodeToken(token: string, customSecretKey?: string): Promise<{
    decodeModel: {
      id: string,
      code: string,
      iat: number,
      exp: number
    }
  }> {
    if (!token) { throw new HttpErrors.BadRequest("Token boş gönderilemez!") }
    try {
      const result = await verifyAsync(token, customSecretKey ? customSecretKey : this.jwtSecret);
      return {
        decodeModel: {
          id: result?.attribute1 || result?.id,
          code: result?.attribute2,
          iat: result?.iat,
          exp: result?.exp
        }
      };
    } catch (error) {
      throw new HttpErrors.Unauthorized(
        `Geçersiz Token : ${error.message}`
      );
    }
  }

  async generateVerifyToken(value: string, code?: string): Promise<string> {
    if (!value) return "";
    let token: string;

    const myModel = !code ? { [securityId]: value, attribute1: value } : { [securityId]: value, attribute1: value, attribute2: code };

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
    const foundUserCredential = await this.userCredentialsRepository.findOne({ where: { userId: { like: res?.decodeModel?.id } } });
    if (foundUserCredential?.emailVerified) throw new HttpErrors.BadRequest("Hesap doğrulaması daha önce yapıldı!");
    const foundCredentialUserCount = await this.userCredentialsRepository.updateAll({ emailVerified: true }, { userId: { like: res?.decodeModel?.id } });
    return foundCredentialUserCount.count > 0 ? true : false;
  }

  async forgot(email: string, link?: any): Promise<boolean> {

    email = email.trim().toLowerCase();
    const foundUser = await this.userRepository.findOne({ where: { email: { like: email } } });
    if (!foundUser) {
      throw new HttpErrors.BadRequest("Bu adrese ait kayıtlı hesap bulunamadı!");
    }
    const token = await this.generateVerifyToken(foundUser.id, Guid.raw());

    if (!token) { throw new HttpErrors.BadRequest("Bir hata oluştu! Lütfen sistem yöneticisine danışınız!"); }
    await this.sendMailForgotPassword(email, foundUser.fullName, token, link);
    return true;
  }

  async resetPassword(resetPassword: ResetPassword): Promise<boolean> {
    if (!resetPassword.code) throw new HttpErrors.BadRequest("Hatalı istek!");

    const res = await this.decodeToken(resetPassword.code, this.jwtVerifySecret);
    if (!res.decodeModel.id) throw new HttpErrors.BadRequest("Geçersiz işlem! Lütfen sistem yöneticisine danışınız!");
    const userId = res.decodeModel.id;

    const foundUser = await this.userRepository.findById(userId);

    if (!foundUser)
      throw new HttpErrors.BadRequest("Kullanıcı bulunamadı! Lütfen sistem yöneticisine danışınız!");

    if (foundUser.email != resetPassword.email)
      throw new HttpErrors.BadRequest(resetPassword.email + " adresine ait eşleşme bulunamadı! Lütfen sistem yöneticisine danışınız!");

    await this.passwordUpdate(foundUser.id, resetPassword.password, undefined, res.decodeModel.code);

    return true;
  }

  private async passwordUpdate(userId: string, currentPassword: string, oldPassword?: string, forgotCode?: string): Promise<void> {
    if (!(currentPassword.length >= 8 && currentPassword.length <= 16))
      throw new HttpErrors.BadRequest("Parola minimum 8 karakter uzunluğunda olmalı!");

    const foundUserCredential = await this.userCredentialsRepository.findOne({ where: { userId: { like: userId } } });
    if (!foundUserCredential)
      throw new HttpErrors.BadRequest("Kullanıcı bulunamadı!");

    if (oldPassword) {
      /**Compare Password */
      await this.comparePassword(oldPassword, foundUserCredential.password, "Parola eski parola ile uyuşmamaktadır!");
    }


    if (forgotCode && foundUserCredential.forgotCode && foundUserCredential.forgotCode == forgotCode) {
      throw new HttpErrors.BadRequest("Bu işlem daha önce yapıldı! Lütfen yeni istek yapınız!");
    }

    // encrypt the password
    const hashNewPassword = await this.passwordHasher.hashPassword(
      currentPassword,
    );
    if (!hashNewPassword)
      throw new HttpErrors.BadRequest("Parola kayıt edilemedi! Lütfen sistem yöneticisine danışınız!");

    await this.userCredentialsRepository.updateAll({ password: hashNewPassword, updatedDate: new Date(), updatedUserId: userId, forgotCode: forgotCode }, { userId: { like: userId } });

    this.sendMailPasswordUpdate(userId);
  }

  async verifyCredentials(credentials: Credentials): Promise<User> {

    const foundUser = await this.userRepository.findOne({
      where: { email: credentials.email },
    });

    if (!foundUser) {
      throw new HttpErrors.BadRequest(invalidCredentialsError);
    }
    const credentialsFound = await this.userCredentialsRepository.findOne({ where: { userId: { like: foundUser.id } } });

    if (!credentialsFound) {
      throw new HttpErrors.BadRequest(invalidCredentialsError);
    }
    /**Compare Password */
    await this.comparePassword(credentials.password, credentialsFound.password);

    // if (!foundUser.isActive) {
    //   throw new HttpErrors.BadRequest(`Sayın ${foundUser.fullName} hesabınız aktif gözükmemektedir. Lütfen sistem yöneticisine danışınız.`);
    // }

    // if (!credentialsFound.emailVerified) {
    //   throw new HttpErrors.BadRequest(`Sayın ${foundUser.fullName} hesabınızın email doğrulaması yapılması gereklidir. Lütfen email kutunuzu kontrol ediniz. Doğrulama yapmanıza rağmen sorun devam etmekteyse lütfen sistem yöneticisine danışınız.`);
    // }

    const foundUserGroup = await this.userGroupRepository.findOne({ where: { userId: { like: foundUser.id } } });

    if (!foundUserGroup && foundUser.platform == PlatformType.Mobile) {
      throw new HttpErrors.BadRequest(`Sayın ${foundUser.fullName} hesabınızın bağlı olduğu bir grup ilişkisi bulunmamaktadır. Lütfen sistem yöneticisine danışınız.`)
    }

    return foundUser;
  }

  async comparePassword(providedPass: string, storedPass: string, errorMessage?: string): Promise<boolean> {
    const passwordMatched = await this.passwordHasher.comparePassword(
      providedPass,
      storedPass,
    );
    if (!passwordMatched) {
      if (errorMessage)
        throw new HttpErrors.BadRequest(errorMessage);
      else
        throw new HttpErrors.BadRequest(invalidCredentialsError);

    }
    return passwordMatched;
  }

  async reVerify(email: string, link?: any): Promise<boolean> {
    const foundUser = await this.userRepository.findOne({ where: { email: { like: email } } });
    if (!foundUser) { throw new HttpErrors.NotFound("Böyle bir hesap bulunamadı") }
    const foundUserCredential = await this.userCredentialsRepository.findOne({ where: { userId: { like: foundUser.id }, emailVerified: true } });
    if (foundUserCredential) { throw new HttpErrors.NotFound("Daha önce hesap doğrulaması yapıldı!") }
    try {
      const token = await this.generateVerifyToken(foundUser.id);
      await this.sendMailRegisterUser(foundUser.email, foundUser.fullName, token, link);
      return true;
    } catch (error) {
      throw new HttpErrors.NotFound(error);
    }
  }

  async sendMailForgotPassword(email: string, fullName: string, token: string, link?: string): Promise<void> {

    let url = `${BaseUrls.UI_Base_Url}/auth/reset-password/${email}/${token}`;
    if (link)
      url = `${link}/auth/reset-password/${email}/${token}`;

    await this.emailManager.setMailModel(fullName, email, MailType.PasswordReset, url).then((response) => {

      this.emailManager.sendMail(response).then((res) => {

        //return { message: `${email} adresine aktivasyon maili gönderilmiştir. Lütfen mailinizi kontrol ediniz.` };
      }).catch((error) => {
        this.errorLogRepository.create({
          name: "User Servis Mail Hata " + error.command,
          code: error.code,
          methodName: "Forgot mail send function",
          errorStack: error.response,
          description: `${email} adresine mail gönderiminde hata oluştu! Lütfen sistem yöneticisine danışınız!`,
          methodInput: response
        });
        //throw new HttpErrors.UnprocessableEntity(`${email} adresine mail gönderiminde hata oluştu! Lütfen sistem yöneticisine danışınız!`);
      });
    }

    )
  }

  async sendMailRegisterUser(email: string, fullName: string, token: string, link?: any): Promise<void> {

    let url = `${BaseUrls.UI_Base_Url}/auth/confirm-email/${email}/${token}`;
    if (link)
      url = `${link}/auth/confirm-email/${email}/${token}`;
    await this.emailManager.setMailModel(fullName, email, MailType.Register, url).then((response) => {
      this.emailManager.sendMail(response).then((res) => {
        //return { message: `${email} adresine aktivasyon maili gönderilmiştir. Lütfen mailinizi kontrol ediniz.` };
      }).catch((error) => {
        this.errorLogRepository.create({
          name: "User Servis Mail Hata " + error.command,
          code: error.code,
          methodName: "Validation mail send function",
          description: `${email} adresine mail gönderiminde hata oluştu! Lütfen sistem yöneticisine danışınız!`,
          errorStack: error,
          methodInput: response
        });
        //throw new HttpErrors.UnprocessableEntity(`${email} adresine mail gönderiminde hata oluştu! Lütfen sistem yöneticisine danışınız!`);
      });
    }

    )

  }

  async sendMailPasswordUpdate(userId: string): Promise<void> {
    const foundUser = await this.userRepository.findById(userId);

    await this.emailManager.setMailModel(foundUser.fullName, foundUser.email, MailType.PasswordUpdate).then((response) => {
      this.emailManager.sendMail(response).then((res) => {
      }).catch((error) => {
        this.errorLogRepository.create({
          name: "User Servis Mail Hata " + error.command,
          code: error.code,
          methodName: "Password notification mail send function",
          description: `${foundUser.email} adresine mail gönderiminde hata oluştu!`,
          errorStack: error.response
        });
      });
    }

    )


  }

  async printCurrentUser(currentuser: UserProfile): Promise<UserInfoOutputModel> {

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

  async updateById(id: string, user: UpdateUserRequest, currentUserProfile: UserProfile): Promise<void> {

    if (!currentUserProfile.roles?.includes(RoleType.Admin)) {
      delete user.roles;
    }

    user.updatedDate = new Date();
    user.updatedUserId = currentUserProfile[securityId];

    if (user.email) {
      await this.foundValidateEmail(id, user.email);
    }

    if (user.currentPassword && user.oldPassword) {
      /**Password Update */
      await this.passwordUpdate(id, user.currentPassword, user.oldPassword)
    }

    await this.userRepository.updateById(id, user);
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

  async foundValidateEmail(userId: string, email: string): Promise<void> {
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
}
