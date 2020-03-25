import { UserService } from "@loopback/authentication";
import { User, UserInfoOutputModel, Group, UserGroup } from "../models";
import { Credentials, UserRepository } from "../repositories/user.repository";
import { HttpErrors } from "@loopback/rest";
import { repository } from "@loopback/repository";
import { PasswordHasherBindings, TokenServiceBindings } from '../keys';
import { PasswordHasher } from "./hash.password.bcryptjs";
import { inject } from "@loopback/context";
import { UserProfile, securityId } from '@loopback/security';
import { UserCredentialsRepository } from "../repositories/user-credentials.repository";
import { UserGroupRepository, UserRoleRepository, GroupRepository, RoleRepository, CalendarRepository } from "../repositories";
import { promisify } from "util";
import { EmailService } from './email.service';
import { service } from '@loopback/core';

const jwt = require('jsonwebtoken');
const verifyAsync = promisify(jwt.verify);

export class MyUserService implements UserService<User, Credentials> {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @repository(UserGroupRepository) public userGroupRepository: UserGroupRepository,
    @repository(GroupRepository) public groupRepository: GroupRepository,
    @repository(CalendarRepository) public calendarRepository: CalendarRepository,
    @repository(UserRoleRepository) public userRoleRepository: UserRoleRepository,
    @repository(RoleRepository) public roleRepository: RoleRepository,
    @repository(UserCredentialsRepository) public userCredentialsRepository: UserCredentialsRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER) public passwordHasher: PasswordHasher,
    @inject(TokenServiceBindings.TOKEN_SECRET)
    private jwtSecret: string,
    @service(EmailService) private emailService: EmailService
  ) { }

  /** İat and Exp times result */
  async decodeToken(token: string): Promise<{
    decodeModel: {
      userId: string,
      iat: number,
      exp: number
    }
  }> {
    if (!token) { throw new HttpErrors.BadRequest("Token boş gönderilemez!") }
    const result = await verifyAsync(token, this.jwtSecret);
    return {
      decodeModel: {
        userId: result?.id,
        iat: result?.iat,
        exp: result?.exp
      }
    };
  }

  async verifyCredentials(credentials: Credentials): Promise<User> {
    const invalidCredentialsError = 'Geçersiz email veya parola!';

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

    const passwordMatched = await this.passwordHasher.comparePassword(
      credentials.password,
      credentialsFound.password,
    );
    if (!passwordMatched) {
      throw new HttpErrors.BadRequest(invalidCredentialsError);
    }

    return foundUser;
  }

  async printCurrentUser(currentuser: UserProfile): Promise<UserInfoOutputModel> {
    //this.emailService.SendMail();
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

  public async emailCheck(email: string): Promise<boolean> {
    const foundEmail = await this.userRepository.findOne({
      where: { email: email },
    });
    if (!foundEmail)
      return true;
    return false;
  }

  async deleteById(userId: typeof User.prototype.id): Promise<void> {

    await this.userRepository.updateAll({ isDeleted: true }, { id: userId }).then(async () => {

      //#region User Credential Delete
      await this.userCredentialsRepository.updateAll({ isDeleted: true }, { userId: { like: userId } });
      //#endregion

      //#region User-Group Delete
      await this.userGroupRepository.updateAll({ isDeleted: true }, { userId: { like: userId } });
      //#endregion

      //#region User-Role Delete
      await this.userRoleRepository.updateAll({ isDeleted: true }, { userId: { like: userId } });
      //#endregion

      //#region Calendar Delete
      await this.calendarRepository.updateAll({ isDeleted: true }, { userId: { like: userId } });
      //#endregion

    }).catch(ex => {
      throw new HttpErrors.NotFound(ex);
    });

  }

}

