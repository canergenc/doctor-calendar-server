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
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
  ) { }

  async verifyCredentials(credentials: Credentials): Promise<User> {
    const invalidCredentialsError = 'Invalid email or password.';

    const foundUser = await this.userRepository.findOne({
      where: { email: credentials.email },
    });

    if (!foundUser) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }
    console.log(foundUser.id);
    const deneme = await this.userCredentialsRepository.find();
    const deneme2 = await this.userCredentialsRepository.find({ where: { userId: foundUser.id } });
    console.log("deneme1");
    console.log(deneme);
    console.log("deneme2");
    console.log(deneme2);
    const credentialsFound = await this.userRepository.findCredentials(
      foundUser.id,
    );
    //console.log(credentialsFound);
    if (!credentialsFound) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    const passwordMatched = await this.passwordHasher.comparePassword(
      credentials.password,
      credentialsFound.password,
    );
    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    return foundUser;
  }

  convertToUserProfile(user: User): UserProfile {
    // since first name and lastName are optional, no error is thrown if not provided
    let userName = '';
    if (user.fullName) userName = `${user.fullName}`;
    return { [securityId]: user.id, name: userName, id: user.id };
  }
}
