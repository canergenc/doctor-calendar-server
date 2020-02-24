import { DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import { UserGroup, UserGroupRelations, Group, User} from '../models';
import { MongoDataSource } from '../datasources';
import { inject, Getter} from '@loopback/core';
import { DataSourceName } from '../keys';
import {GroupRepository} from './group.repository';
import {UserRepository} from './user.repository';

export class UserGroupRepository extends DefaultCrudRepository<
  UserGroup,
  typeof UserGroup.prototype.id,
  UserGroupRelations
  > {

  public readonly group: BelongsToAccessor<Group, typeof UserGroup.prototype.id>;

  public readonly user: BelongsToAccessor<User, typeof UserGroup.prototype.id>;

  constructor(
    @inject(DataSourceName.Data_Source_Name) dataSource: MongoDataSource, @repository.getter('GroupRepository') protected groupRepositoryGetter: Getter<GroupRepository>, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(UserGroup, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
    this.group = this.createBelongsToAccessorFor('group', groupRepositoryGetter,);
    this.registerInclusionResolver('group', this.group.inclusionResolver);
  }
}
