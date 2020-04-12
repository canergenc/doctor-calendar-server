import { bind, BindingScope, inject } from '@loopback/core';
import { repository, Filter, Where, Count } from '@loopback/repository';
import { CalendarRepository, GroupSettingRepository, UserRepository, UserGroupRepository } from '../repositories';
import { Calendar } from '../models';
import { UserProfile, SecurityBindings, securityId } from '@loopback/security';
import { CalendarType } from '../enums/calendarType.enum';
import { HttpErrors } from '@loopback/rest';

@bind({ scope: BindingScope.TRANSIENT })
export class CalendarService {

  constructor(
    @repository(CalendarRepository) private calendarRepository: CalendarRepository,
    @repository(UserRepository) private userRepository: UserRepository,
    @repository(GroupSettingRepository) private groupSettingRepository: GroupSettingRepository,
    @repository(UserGroupRepository) private userGroupRepository: UserGroupRepository,

    @inject(SecurityBindings.USER) public currentUserProfile: UserProfile
  ) { }

  async create(calendar: Calendar): Promise<Calendar> {
    /*audit set */
    calendar.createdUserId = calendar.updatedUserId = this.currentUserProfile[securityId];
    delete this.currentUserProfile[securityId];

    /*calendar rest day control */
    await this.dataValidate(calendar, true, true, true);

    return this.calendarRepository.create(calendar);
  }

  async createBulk(calendars: Calendar[]): Promise<Calendar[]> {
    try {
      for (const calendar of calendars) {
        calendar.createdUserId = calendar.updatedUserId = this.currentUserProfile[securityId];
        /*calendar rest day control */
        await this.dataValidate(calendar, true, true, true);
      }
      return await this.calendarRepository.createAll(calendars);
    } catch (error) {
      throw new HttpErrors.BadRequest(error.message);
    }
  }

  private async dataValidate(calendar: Calendar, userGroupValidate: boolean, duplicateValidate: boolean, groupSettingValidate: boolean): Promise<void> {

    if (userGroupValidate)
      await this.userGroupRelationControl(calendar);
    if (duplicateValidate)
      await this.duplicateValidate(calendar);
    if (groupSettingValidate)
      await this.groupSettingValidate(calendar);

  }

  private async duplicateValidate(calendar: Calendar): Promise<void> {
    if (!calendar.date || !calendar.userId) return;
    /* Duplicate Control */
    const duplicateResult = await this.calendarRepository.findOne({
      where:
      {
        date: calendar.date,
        userId: { like: calendar.userId }
      }
    });
    if (duplicateResult) throw new HttpErrors.BadRequest('İlgili kullanıcının bu tarihe ait kaydı bulunmaktadır, takvime eklenemez!');

  }

  private async groupSettingValidate(calendar: Calendar): Promise<void> {
    if (!calendar.groupId || !calendar.userId) return;

    const groupSetting = await this.groupSettingRepository.findOne({ where: { groupId: { like: calendar.groupId } } });
    const userData = await this.userRepository.findById(calendar.userId);
    const calendarList = await this.calendarRepository.find({ where: { userId: { like: calendar.userId }, groupId: { like: calendar.groupId }, type: CalendarType.Nöbet } });

    if (groupSetting?.isWeekdayControl) {
      if (!userData.weekdayCountLimit) {
        throw new HttpErrors.BadRequest(userData.fullName + " kullanıcısına ait haftaiçi nöbet sınır adedi belirtilmemiş! Kayıt atanamaz.");
      }
      const calendarUserWeekdayCount = calendarList.filter(x => x.isWeekend = false);

      if (calendarUserWeekdayCount?.length > userData.weekdayCountLimit) {
        throw new HttpErrors.BadRequest(userData.fullName + " ait haftaiçi nöbet sınır adedi aşıldı! Kayıt atanamaz.")
      }
    }

    if (groupSetting?.isWeekendControl) {
      if (!userData.weekendCountLimit) {
        throw new HttpErrors.BadRequest(userData.fullName + " kullanıcısına ait haftasonu nöbet sınır adedi belirtilmemiş! Kayıt atanamaz.");
      }
      const calendarUserWeekendCount = calendarList.filter(x => x.isWeekend = true);

      if (calendarUserWeekendCount?.length > userData.weekendCountLimit) {
        throw new HttpErrors.BadRequest(userData.fullName + " ait haftasonu nöbet sınır adedi aşıldı! Kayıt atanamaz.")
      }

    }
  }

  private async userGroupRelationControl(calendar: Calendar): Promise<void> {
    if (!calendar.userId || !calendar.groupId) return;
    const foundUserGroup = await this.userGroupRepository.findOne({ where: { userId: { like: calendar.userId }, groupId: { like: calendar.groupId } } });
    if (!foundUserGroup) {
      throw new HttpErrors.BadRequest('İlgili kullanıcının bu gruba ait ilişki bulunmaktadır. Kayıt atanamaz!');
    }
  }

  private async updateValidateSet(id: string, calendar: Calendar): Promise<Calendar> {
    const foundCalendar = await this.calendarRepository.findById(id);

    if (!calendar.groupId) {
      calendar.groupId = foundCalendar.groupId;
    }
    if (!calendar.userId) {
      calendar.userId = foundCalendar.userId;
    }
    return calendar;
  }

  async updateAll(calendar: Calendar, where?: Where<Calendar>): Promise<Count> {
    await this.dataValidate(calendar, false, true, true);
    calendar.updatedDate = new Date();
    calendar.updatedUserId = this.currentUserProfile[securityId];
    return this.calendarRepository.updateAll(calendar, where);
  }

  async updateById(id: string, calendar: Calendar): Promise<void> {
    calendar = await this.updateValidateSet(id, calendar);
    await this.dataValidate(calendar, true, true, true);
    calendar.updatedDate = new Date();
    calendar.updatedUserId = this.currentUserProfile[securityId];
    delete this.currentUserProfile[securityId];
    await this.calendarRepository.updateById(id, calendar);
  }

  async deleteById(id: string): Promise<void> {
    await this.calendarRepository.updateAll({
      isDeleted: true,
      updatedDate: new Date(),
      updatedUserId: this.currentUserProfile[securityId]
    }, { id: id }).catch(ex => {
      throw new HttpErrors.NotFound(ex);
    });
  }
}
