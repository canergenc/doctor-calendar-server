import { DefaultCrudRepository, juggler } from '@loopback/repository';
import { Location, LocationRelations } from '../models';
import { inject } from '@loopback/core';
import { DataSourceName } from '../keys';

export class LocationRepository extends DefaultCrudRepository<
  Location,
  typeof Location.prototype.id,
  LocationRelations
  > {
  constructor(
    @inject(DataSourceName.Data_Source_Name) dataSource: juggler.DataSource,
  ) {
    super(Location, dataSource);
  }
}
