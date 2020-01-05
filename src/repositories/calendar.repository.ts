import {DefaultCrudRepository} from '@loopback/repository';
import {Calendar, CalendarRelations} from '../models';
import {CalendarMdDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class CalendarRepository extends DefaultCrudRepository<
  Calendar,
  typeof Calendar.prototype.id,
  CalendarRelations
> {
  constructor(
    @inject('datasources.calendarMd') dataSource: CalendarMdDataSource,
  ) {
    super(Calendar, dataSource);
  }
}
