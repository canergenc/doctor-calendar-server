import { DefaultCrudRepository } from '@loopback/repository';
import { Group } from '../models';
import { FirestoreDataSource } from '../datasources';
import { inject } from '@loopback/core';
import { DataSourceName } from '../keys';

export class GroupRepository extends DefaultCrudRepository<
  Group,
  typeof Group.prototype.id
  > {
  constructor(
    @inject(DataSourceName.DATA_SOURCE_NAME) dataSource: FirestoreDataSource,
  ) {
    super(Group, dataSource);
  }
}
