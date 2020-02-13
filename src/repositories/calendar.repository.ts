import { DefaultCrudRepository, juggler } from '@loopback/repository';
import { Calendar, CalendarRelations } from '../models';
import { inject } from '@loopback/core';
import { DataSourceName } from '../keys';

export class CalendarRepository extends DefaultCrudRepository<
  Calendar,
  typeof Calendar.prototype.id,
  CalendarRelations
  > {
  constructor(
    @inject(DataSourceName.Data_Source_Name) dataSource: juggler.DataSource,
  ) {
    super(Calendar, dataSource);
  }
}
