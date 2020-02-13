import { DefaultCrudRepository, juggler } from '@loopback/repository';
import { Role, RoleRelations } from '../models';
import { inject } from '@loopback/core';
import { DataSourceName } from '../keys';

export class RoleRepository extends DefaultCrudRepository<
  Role,
  typeof Role.prototype.id,
  RoleRelations
  > {
  constructor(
    @inject(DataSourceName.Data_Source_Name) dataSource: juggler.DataSource,
  ) {
    super(Role, dataSource);
  }
}
