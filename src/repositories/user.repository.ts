import { DefaultCrudRepository, HasOneRepositoryFactory, repository, juggler } from '@loopback/repository';
import { User, UserRelations, UserCredentials } from '../models';
import { inject, Getter } from '@loopback/core';
import { UserCredentialsRepository } from './user-credentials.repository';
import { DataSourceName } from '../keys';

export type Credentials = {
  email: string;
  password: string;
};

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
  > {
  //public calendar: HasOneRepositoryFactory<Calendar, typeof User.prototype.id>;
  public readonly userCredentials: HasOneRepositoryFactory<
    UserCredentials,
    typeof User.prototype.id
  >;
  constructor(
    @inject(DataSourceName.Data_Source_Name) dataSource: juggler.DataSource,
    //@repository(CalendarRepository) protected calendarRepository: CalendarRepository,
    @repository.getter('UserCredentialsRepository')
    protected userCredentialsRepositoryGetter: Getter<
      UserCredentialsRepository
    >
  ) {
    super(User, dataSource);
    this.userCredentials = this.createHasOneRepositoryFactoryFor('userCredentials', userCredentialsRepositoryGetter);
    //this.calendar = this.createHasOneRepositoryFactoryFor('calendar', async () => calendarRepository);
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
}
