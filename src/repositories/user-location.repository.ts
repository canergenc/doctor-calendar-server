import { DefaultCrudRepository, juggler } from '@loopback/repository';
import { UserLocation, UserLocationRelations } from '../models';
import { inject } from '@loopback/core';

export class UserLocationRepository extends DefaultCrudRepository<
  UserLocation,
  typeof UserLocation.prototype.id,
  UserLocationRelations
  > {
  constructor(
    @inject('datasources.mongo') dataSource: juggler.DataSource,
  ) {
    super(UserLocation, dataSource);
  }
}
