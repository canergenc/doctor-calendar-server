import { DefaultCrudRepository, juggler } from '@loopback/repository';
import { UserRole, UserRoleRelations } from '../models';
import { inject } from '@loopback/core';
import { DataSourceName } from '../keys';

export class UserRoleRepository extends DefaultCrudRepository<
  UserRole,
  typeof UserRole.prototype.id,
  UserRoleRelations
  > {
  constructor(
    @inject(DataSourceName.Data_Source_Name) dataSource: juggler.DataSource,
  ) {
    super(UserRole, dataSource);
  }
}
