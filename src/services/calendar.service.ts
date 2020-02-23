import { bind, /* inject, */ BindingScope } from '@loopback/core';
import { repository, Filter } from '@loopback/repository';
import { CalendarRepository, GroupRepository } from '../repositories';
import { Calendar } from '../models';

@bind({ scope: BindingScope.TRANSIENT })
export class CalendarService {
  constructor(
    @repository(CalendarRepository) public calendarRepository: CalendarRepository,
    @repository(GroupRepository) public groupRepository: GroupRepository
  ) { }

  // async find(filter: Filter<Calendar>): Promise<CalendarOutpuModel> {
  //   const output = new CalendarOutpuModel();
  //   const resultCalendar = this.calendarRepository.find(filter);
  //   if (resultCalendar) {
  //     (await resultCalendar).forEach((calendar) => {
  //       if (calendar.groupId) {
  //         output.group = this.groupRepository.findById(calendar.groupId);
  //       }

  //     })
  //   }
  // }
}
