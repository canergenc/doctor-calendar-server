import { DefaultCrudRepository, juggler } from '@loopback/repository';
import { Location, LocationRelations } from '../models';
import { inject } from '@loopback/core';

export class LocationRepository extends DefaultCrudRepository<
  Location,
  typeof Location.prototype.id,
  LocationRelations
  > {
  constructor(
    @inject('datasources.mongo') dataSource: juggler.DataSource,
  ) {
    super(Location, dataSource);
  }
}
