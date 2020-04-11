import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {UserSetting, UserSettingRelations, User} from '../models';
import {MongoDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {UserRepository} from './user.repository';

export class UserSettingRepository extends DefaultCrudRepository<
  UserSetting,
  typeof UserSetting.prototype.id,
  UserSettingRelations
> {

  public readonly user: BelongsToAccessor<User, typeof UserSetting.prototype.id>;

  constructor(
    @inject('datasources.mongo') dataSource: MongoDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(UserSetting, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
