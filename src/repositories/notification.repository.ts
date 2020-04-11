import { DefaultCrudRepository, juggler } from '@loopback/repository';
import { Notification, NotificationRelations } from '../models';
import { MongoDataSource } from '../datasources';
import { inject } from '@loopback/core';
import { DataSourceName } from '../keys';

export class NotificationRepository extends DefaultCrudRepository<
  Notification,
  typeof Notification.prototype.id,
  NotificationRelations
  > {
  constructor(
    @inject(DataSourceName.DATA_SOURCE_NAME) dataSource: juggler.DataSource
  ) {
    super(Notification, dataSource);
  }
}
