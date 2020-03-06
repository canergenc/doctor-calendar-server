import { bind, BindingScope, inject } from '@loopback/core';
import { repository } from '@loopback/repository';
import { CalendarRepository } from '../repositories';
import { Calendar } from '../models';
import { UserProfile, SecurityBindings, securityId } from '@loopback/security';

@bind({ scope: BindingScope.TRANSIENT })
export class CalendarService {

  constructor(
    @repository(CalendarRepository) public calendarRepository: CalendarRepository,
    @inject(SecurityBindings.USER) public currentUserProfile: UserProfile
  ) { }

  async create(calendar: Calendar): Promise<Calendar> {
    calendar.createdUserId = calendar.updatedUserId = this.currentUserProfile[securityId];
    delete this.currentUserProfile[securityId];
    return this.calendarRepository.create(calendar);
  }

  async updateById(id: string, calendar: Calendar): Promise<void> {
    calendar.updatedDate = new Date();
    calendar.updatedUserId = this.currentUserProfile[securityId];
    delete this.currentUserProfile[securityId];
    await this.calendarRepository.updateById(id, calendar);
  }
}
