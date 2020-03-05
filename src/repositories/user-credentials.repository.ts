import { DefaultCrudRepository, juggler } from '@loopback/repository';
import { UserCredentials, UserCredentialsRelations } from '../models';
import { inject } from '@loopback/core';
import { DataSourceName } from '../keys';

export class UserCredentialsRepository extends DefaultCrudRepository<
  UserCredentials,
  typeof UserCredentials.prototype.id,
  UserCredentialsRelations
  > {
  constructor(
    @inject(DataSourceName.DATA_SOURCE_NAME) dataSource: juggler.DataSource,
  ) {
    super(UserCredentials, dataSource);
  }
}
