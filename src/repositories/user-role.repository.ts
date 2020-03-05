import { DefaultCrudRepository, juggler, repository, BelongsToAccessor } from '@loopback/repository';
import { UserRole, User, Role } from '../models';
import { inject, Getter } from '@loopback/core';
import { DataSourceName } from '../keys';
import { UserRepository } from './user.repository';
import { RoleRepository } from './role.repository';

export class UserRoleRepository extends DefaultCrudRepository<
  UserRole,
  typeof UserRole.prototype.id
  > {

  public readonly user: BelongsToAccessor<User, typeof UserRole.prototype.id>;

  public readonly role: BelongsToAccessor<Role, typeof UserRole.prototype.id>;

  constructor(
    @inject(DataSourceName.DATA_SOURCE_NAME) dataSource: juggler.DataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>, @repository.getter('RoleRepository') protected roleRepositoryGetter: Getter<RoleRepository>,
  ) {
    super(UserRole, dataSource);
    this.role = this.createBelongsToAccessorFor('role', roleRepositoryGetter);
    this.registerInclusionResolver('role', this.role.inclusionResolver);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
