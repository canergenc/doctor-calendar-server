import { DefaultCrudRepository, juggler } from '@loopback/repository';
import { Role, RoleRelations } from '../models';
import { inject } from '@loopback/core';

export class RoleRepository extends DefaultCrudRepository<
  Role,
  typeof Role.prototype.id,
  RoleRelations
  > {
  constructor(
    @inject('datasources.mongo') dataSource: juggler.DataSource,
  ) {
    super(Role, dataSource);
  }
}
