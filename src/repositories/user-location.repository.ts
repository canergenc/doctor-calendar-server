import { DefaultCrudRepository } from '@loopback/repository';
import { UserLocation, UserLocationRelations } from '../models';
import { MongoDataSource } from '../datasources';
import { inject } from '@loopback/core';

export class UserLocationRepository extends DefaultCrudRepository<
  UserLocation,
  typeof UserLocation.prototype.id,
  UserLocationRelations
  > {
  constructor(
    @inject('datasources.mongo') dataSource: MongoDataSource,
  ) {
    super(UserLocation, dataSource);
  }
}
