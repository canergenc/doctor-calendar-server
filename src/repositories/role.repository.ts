import { DefaultCrudRepository, juggler } from '@loopback/repository';
import { Role } from '../models';
import { inject } from '@loopback/core';
import { DataSourceName } from '../keys';

export class RoleRepository extends DefaultCrudRepository<
  Role,
  typeof Role.prototype.id
  > {
  constructor(
    @inject(DataSourceName.DATA_SOURCE_NAME) dataSource: juggler.DataSource,
  ) {
    super(Role, dataSource);
  }
}
