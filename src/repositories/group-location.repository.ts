import {DefaultCrudRepository} from '@loopback/repository';
import {GroupLocation, GroupLocationRelations} from '../models';
import {FirestoreDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class GroupLocationRepository extends DefaultCrudRepository<
  GroupLocation,
  typeof GroupLocation.prototype.id,
  GroupLocationRelations
> {
  constructor(
    @inject('datasources.firestore') dataSource: FirestoreDataSource,
  ) {
    super(GroupLocation, dataSource);
  }
}
