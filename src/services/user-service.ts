import { UserService } from "@loopback/authentication";
import { User } from "../models";
import { Credentials, UserRepository } from "../repositories/user.repository";
import { HttpErrors } from "@loopback/rest";
import { repository } from "@loopback/repository";
import { PasswordHasherBindings } from '../keys';
import { PasswordHasher } from "./hash.password.bcryptjs";
import { inject } from "@loopback/context";
import { UserProfile, securityId } from '@loopback/security';
import { UserCredentialsRepository } from "../repositories/user-credentials.repository";

export class MyUserService implements UserService<User, Credentials> {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @repository(UserCredentialsRepository) public userCredentialsRepository: UserCredentialsRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER) public passwordHasher: PasswordHasher,
    // @inject(SecurityBindings.USER) public currentUserProfile: UserProfile
  ) { }

  async updateById(id: string, user: User): Promise<void> {
    user.updatedDate = new Date();
    // user.updatedUserId = this.currentUserProfile[securityId];
    // delete this.currentUserProfile[securityId];
    await this.userRepository.updateById(id, user);
  }

  async verifyCredentials(credentials: Credentials): Promise<User> {
    const invalidCredentialsError = 'Geçersiz email veya parola!';

    const foundUser = await this.userRepository.findOne({
      where: { email: credentials.email },
    });

    if (!foundUser) {
      throw new HttpErrors.BadRequest(invalidCredentialsError);
    }
    /* Geçici çözüm olarak yapıldı. Düzeltme yapılacak.*/
    const userCredentials = await this.userCredentialsRepository.find();
    const credentialsFound = userCredentials.find(x => x.userId === foundUser.id);
    /*const credentialsFound = await this.userRepository.findCredentials(
      foundUser.id,
    );*/
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

  convertToUserProfile(user: User): UserProfile {
    // since first name and lastName are optional, no error is thrown if not provided
    let userName = '';
    if (user.fullName) userName = `${user.fullName}`;
    return { [securityId]: user.id, name: userName, id: user.id };
  }

  public async emailCheck(email: string): Promise<boolean> {
    const foundEmail = await this.userRepository.findOne({
      where: { email: email },
    });
    if (!foundEmail)
      return true;
    return false;
  }
}
