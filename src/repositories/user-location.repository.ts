import { DefaultCrudRepository, juggler } from '@loopback/repository';
import { UserLocation, UserLocationRelations } from '../models';
import { inject } from '@loopback/core';
import { DataSourceName } from '../keys';

export class UserLocationRepository extends DefaultCrudRepository<
  UserLocation,
  typeof UserLocation.prototype.id,
  UserLocationRelations
  > {
  constructor(
    @inject(DataSourceName.Data_Source_Name) dataSource: juggler.DataSource,
  ) {
    super(UserLocation, dataSource);
  }
}
