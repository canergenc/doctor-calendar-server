import { DefaultCrudRepository } from '@loopback/repository';
import { Group, GroupRelations } from '../models';
import { FirestoreDataSource } from '../datasources';
import { inject } from '@loopback/core';
import { DataSourceName } from '../keys';

export class GroupRepository extends DefaultCrudRepository<
  Group,
  typeof Group.prototype.id,
  GroupRelations
  > {
  constructor(
    @inject(DataSourceName.Data_Source_Name) dataSource: FirestoreDataSource,
  ) {
    super(Group, dataSource);
  }
}
