import { DefaultCrudRepository, repository, BelongsToAccessor, juggler } from '@loopback/repository';
import { UserSetting, UserSettingRelations, User } from '../models';
import { MongoDataSource } from '../datasources';
import { inject, Getter } from '@loopback/core';
import { UserRepository } from './user.repository';
import { DataSourceName } from '../keys';

export class UserSettingRepository extends DefaultCrudRepository<
  UserSetting,
  typeof UserSetting.prototype.id,
  UserSettingRelations
  > {

  public readonly user: BelongsToAccessor<User, typeof UserSetting.prototype.id>;

  constructor(
    @inject(DataSourceName.DATA_SOURCE_NAME) dataSource: juggler.DataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(UserSetting, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
