import { DefaultCrudRepository } from '@loopback/repository';
import { GroupLocation, GroupLocationRelations } from '../models';
import { FirestoreDataSource } from '../datasources';
import { inject } from '@loopback/core';
import { DataSourceName } from '../keys';

export class GroupLocationRepository extends DefaultCrudRepository<
  GroupLocation,
  typeof GroupLocation.prototype.id,
  GroupLocationRelations
  > {
  constructor(
    @inject(DataSourceName.Data_Source_Name) dataSource: FirestoreDataSource,
  ) {
    super(GroupLocation, dataSource);
  }
}
