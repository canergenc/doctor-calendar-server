import { DefaultCrudRepository, juggler } from '@loopback/repository';
import { UserRole, UserRoleRelations } from '../models';
import { inject } from '@loopback/core';

export class UserRoleRepository extends DefaultCrudRepository<
  UserRole,
  typeof UserRole.prototype.id,
  UserRoleRelations
  > {
  constructor(
    @inject('datasources.mongo') dataSource: juggler.DataSource,
  ) {
    super(UserRole, dataSource);
  }
}
