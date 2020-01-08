import { DefaultCrudRepository, juggler } from '@loopback/repository';
import { Calendar, CalendarRelations } from '../models';
import { inject } from '@loopback/core';

export class CalendarRepository extends DefaultCrudRepository<
  Calendar,
  typeof Calendar.prototype.id,
  CalendarRelations
  > {
  constructor(
    @inject('datasources.mongo') dataSource: juggler.DataSource,
  ) {
    super(Calendar, dataSource);
  }
}
