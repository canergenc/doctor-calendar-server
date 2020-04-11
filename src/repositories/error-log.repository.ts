import { DefaultCrudRepository, juggler } from '@loopback/repository';
import { ErrorLog, ErrorLogRelations } from '../models';
import { MongoDataSource } from '../datasources';
import { inject } from '@loopback/core';
import { DataSourceName } from '../keys';

export class ErrorLogRepository extends DefaultCrudRepository<
  ErrorLog,
  typeof ErrorLog.prototype.id,
  ErrorLogRelations
  > {
  constructor(
    @inject(DataSourceName.DATA_SOURCE_NAME) dataSource: juggler.DataSource,
  ) {
    super(ErrorLog, dataSource);
  }
}
