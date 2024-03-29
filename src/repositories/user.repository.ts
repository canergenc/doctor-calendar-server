import { DefaultCrudRepository, HasOneRepositoryFactory, repository, juggler } from '@loopback/repository';
import { User, UserCredentials } from '../models';
import { inject, Getter } from '@loopback/core';
import { UserCredentialsRepository } from './user-credentials.repository';
import { DataSourceName } from '../keys';
import { HttpErrors } from '@loopback/rest';

export type Credentials = {
  email: string;
  password: string;
};

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id
  > {
  public readonly userCredentials: HasOneRepositoryFactory<UserCredentials, typeof User.prototype.id>;

  constructor(
    @inject(DataSourceName.DATA_SOURCE_NAME) dataSource: juggler.DataSource,
    @repository(UserCredentialsRepository)
    public userCredentialsRepository: UserCredentialsRepository,
    @repository.getter('UserCredentialsRepository')
    protected userCredentialsRepositoryGetter: Getter<
      UserCredentialsRepository
    >,
  ) {
    super(User, dataSource);
    this.userCredentials = this.createHasOneRepositoryFactoryFor('userCredentials', userCredentialsRepositoryGetter);
  }
  async findCredentials(
    userId: typeof User.prototype.id,
  ): Promise<UserCredentials | undefined> {
    try {
      return await this.userCredentials(userId).get();
    } catch (err) {
      if (err.code === 'ENTITY_NOT_FOUND') {
        return undefined;
      }
      throw err;
    }
  }

  async findEmail(email: typeof User.prototype.email): Promise<Boolean> {
    const foundUser = await this.findOne({
      where: { email: email }
    });
    if (foundUser)
      return true;
    return false;
  }
}
