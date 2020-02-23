import { DefaultCrudRepository } from '@loopback/repository';
import { UserGroup, UserGroupRelations } from '../models';
import { MongoDataSource } from '../datasources';
import { inject } from '@loopback/core';
import { DataSourceName } from '../keys';

export class UserGroupRepository extends DefaultCrudRepository<
  UserGroup,
  typeof UserGroup.prototype.id,
  UserGroupRelations
  > {
  constructor(
    @inject(DataSourceName.Data_Source_Name) dataSource: MongoDataSource,
  ) {
    super(UserGroup, dataSource);
  }
}
