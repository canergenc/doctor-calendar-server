import { bind, BindingScope, inject } from '@loopback/core';
import { repository } from '@loopback/repository';
import { CalendarRepository } from '../repositories';
import { Calendar } from '../models';
import { UserProfile, SecurityBindings, securityId } from '@loopback/security';
import { CalendarType } from '../enums/calendarType.enum';
import { HttpErrors } from '@loopback/rest';

@bind({ scope: BindingScope.TRANSIENT })
export class CalendarService {

  constructor(
    @repository(CalendarRepository) public calendarRepository: CalendarRepository,
    @inject(SecurityBindings.USER) public currentUserProfile: UserProfile
  ) { }

  async create(calendar: Calendar): Promise<Calendar> {
    /*audit set */
    calendar.createdUserId = calendar.updatedUserId = this.currentUserProfile[securityId];
    delete this.currentUserProfile[securityId];

    /*calendar rest day control */
    await this.dataControl(calendar);

    return this.calendarRepository.create(calendar);
  }

  async createBulk(calendars: Calendar[]): Promise<Calendar[]> {
    try {
      for (const calendar of calendars) {
        calendar.createdUserId = calendar.updatedUserId = this.currentUserProfile[securityId];
        /*calendar rest day control */
        await this.dataControl(calendar);
      }
      return await this.calendarRepository.createAll(calendars);
    } catch (error) {
      throw new HttpErrors.BadRequest(error.message);
    }
  }

  private async dataControl(calendar: Calendar): Promise<void> {

    /* Duplicate Control */
    const duplicateResult = await this.calendarRepository.findOne({
      where:
      {
        date: calendar.date,
        userId: { like: calendar.userId },
        type: calendar.type,
        groupId: { like: calendar.groupId },
        locationId: { like: calendar.locationId }
      }
    });
    if (duplicateResult) throw new HttpErrors.BadRequest('İlgili kullanıcının bu tarihe ait kaydı bulunmaktadır, takvime eklenemez!');

    /*calendar rest day control */
    const result = await this.calendarRepository.findOne({ where: { date: calendar.date, userId: { like: calendar.userId }, type: CalendarType.İzin } });
    if (result) throw new HttpErrors.BadRequest('İlgili kullanıcının bu tarihe ait izin kaydı bulunmaktadır, takvime eklenemez!');

  }

  async updateById(id: string, calendar: Calendar): Promise<void> {
    calendar.updatedDate = new Date();
    calendar.updatedUserId = this.currentUserProfile[securityId];
    delete this.currentUserProfile[securityId];
    await this.calendarRepository.updateById(id, calendar);
  }

  async deleteById(id: string): Promise<void> {
    await this.calendarRepository.findOne({ where: { id: id } }).then(async result => {
      if (result) {
        result.isDeleted = true;
        await this.calendarRepository.updateById(id, result);
      }
    })
  }
}
