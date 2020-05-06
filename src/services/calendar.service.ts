import { bind, BindingScope, inject } from '@loopback/core';
import { repository, Filter, Where, Count } from '@loopback/repository';
import { CalendarRepository, GroupSettingRepository, UserRepository, UserGroupRepository, LocationRepository } from '../repositories';
import { Calendar, User } from '../models';
import { UserProfile, SecurityBindings, securityId } from '@loopback/security';
import { CalendarType } from '../enums/calendarType.enum';
import { HttpErrors } from '@loopback/rest';
import { StatusType } from '../enums/status.enum';

@bind({ scope: BindingScope.TRANSIENT })
export class CalendarService {

  constructor(
    @repository(CalendarRepository) private calendarRepository: CalendarRepository,
    @repository(UserRepository) private userRepository: UserRepository,
    @repository(GroupSettingRepository) private groupSettingRepository: GroupSettingRepository,
    @repository(UserGroupRepository) private userGroupRepository: UserGroupRepository,
    @repository(LocationRepository) private locationRepository: LocationRepository,

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

  private async dataValidate(calendar: Calendar, userGroupValidate: boolean, duplicateValidate: boolean, groupSettingValidate: boolean, id?: string): Promise<void> {

    if (userGroupValidate)
      await this.userGroupRelationControl(calendar);
    if (duplicateValidate)
      await this.duplicateValidate(calendar);
    if (groupSettingValidate)
      await this.groupSettingValidate(calendar, id);

  }

  private async duplicateValidate(calendar: Calendar): Promise<void> {
    if (!calendar.startDate || !calendar.endDate || !calendar.userId) return;
    /* Duplicate Control */
    const duplicateResult = await this.calendarRepository.findOne({
      where:
      {
        or: [{
          startDate: { between: [calendar.startDate, calendar.endDate] }
        },
        {
          endDate: { between: [calendar.startDate, calendar.endDate] }
        }],
        userId: { like: calendar.userId },
        status: { neq: StatusType.Rejected }
      }
    });
    if (duplicateResult) {
      const userData = await this.userRepository.findById(calendar.userId);
      const message = await this.validateMessageSet(duplicateResult, userData);
      throw new HttpErrors.BadRequest(message);
    }

  }

  private async groupSettingValidate(calendar: Calendar, id?: string): Promise<void> {
    if (!calendar.groupId || !calendar.userId || calendar.type !== CalendarType.Nöbet) return;
    const groupSetting = await this.groupSettingRepository.findOne({ where: { groupId: { like: calendar.groupId } } });
    const userData = await this.userRepository.findById(calendar.userId);
    const userGroupData = await this.userGroupRepository.findOne({ where: { userId: { like: calendar.userId }, groupId: { like: calendar.groupId } } });
    let calendarList = await this.calendarRepository.find({ where: { groupId: { like: calendar.groupId }, type: CalendarType.Nöbet } });
    if (id)
      calendarList = calendarList.filter(x => x.id != id);

    if (groupSetting?.isWeekdayControl && !calendar.isWeekend) {
      if (!userGroupData?.weekdayCountLimit) {
        throw new HttpErrors.BadRequest(userData.fullName + " kullanıcısına ait haftaiçi nöbet sınır adedi belirtilmemiş! Kayıt atanamaz.");
      }
      const calendarUserWeekdayCount = await calendarList.filter(x => x.userId == calendar.userId && x.isWeekend == false);
      if (calendarUserWeekdayCount?.length >= userGroupData?.weekdayCountLimit) {
        throw new HttpErrors.BadRequest(userData.fullName + " kullanıcısına ait atanabilir haftaiçi nöbet sayısı " + userGroupData.weekdayCountLimit + " ile sınırlıdır. Kayıt atanamaz!")
      }
    }

    if (groupSetting?.isWeekendControl && calendar.isWeekend) {
      if (!userGroupData?.weekendCountLimit) {
        throw new HttpErrors.BadRequest(userData.fullName + " kullanıcısına ait haftasonu nöbet sınır adedi belirtilmemiş! Kayıt atanamaz.");
      }
      const calendarUserWeekendCount = await calendarList.filter(x => x.userId == calendar.userId && x.isWeekend == true);
      if (calendarUserWeekendCount?.length >= userGroupData?.weekendCountLimit) {
        throw new HttpErrors.BadRequest(userData.fullName + " kullanıcısına ait atanabilir haftasonu nöbet sayısı " + userGroupData.weekendCountLimit + " ile sınırlıdır. Kayıt atanamaz!")
      }

    }

    if (groupSetting?.sequentialOrderLimitCount) {
      const dayLimit = groupSetting?.sequentialOrderLimitCount;
      const calendarStartDate = new Date(calendar.startDate);
      const calendarEndDate = new Date(calendar.endDate);
      let calendarDayCount = 1;
      calendarDayCount += calendarEndDate.getDay() - calendarStartDate.getDay();

      await this.sequientalOrderLimitControlMessage(calendarDayCount, dayLimit, userData.fullName);


      let foundEndCalendarCount = calendarList.filter(x => x.userId == calendar.userId &&
        x.endDate.getDate() <= new Date(calendar.startDate).getDate() &&
        x.endDate.getDate() >= new Date(calendar.startDate).getDate() - dayLimit

      );

      for (const item of foundEndCalendarCount) {
        if (item.endDate.getDay() == item.startDate.getDay()) {
          calendarDayCount++;
        } else
          calendarDayCount += (item.endDate.getDay() - item.startDate.getDay()) + 1;
      }
      await this.sequientalOrderLimitControlMessage(calendarDayCount, dayLimit, userData.fullName);

      /**End Date Limit Control */
      const foundSecondEndCalendarCount = calendarList.filter(x => x.userId == calendar.userId &&
        x.startDate.getDate() >= new Date(calendar.endDate).getDate() &&
        x.startDate.getDate() <= new Date(calendar.endDate).getDate() + dayLimit
      );

      for (const item of foundSecondEndCalendarCount) {
        if (item.endDate.getDay() == item.startDate.getDay()) {
          calendarDayCount++;
        } else
          calendarDayCount += (item.endDate.getDay() - item.startDate.getDay()) + 1;
      }
      await this.sequientalOrderLimitControlMessage(calendarDayCount, dayLimit, userData.fullName);
    }

    if (groupSetting?.locationDayLimit && calendar.locationId) {
      const foundLocation = await this.locationRepository.findById(calendar.locationId);
      if (!foundLocation.dayLimit) {
        throw new HttpErrors.BadRequest(foundLocation.name + " lokasyona ait nöbet sınır adedi belirtilmemiş! Kayıt atanamaz.");
      }
      const startDate = new Date(calendar.startDate);
      /*geçici çözüm olarak yapıldı daha sonra düzeltilecek. */
      const foundCalendar = calendarList.filter(
        x => x.locationId == calendar.locationId && startDate <= x.startDate && startDate >= x.endDate
      );
      console.log(foundCalendar.length);
      if (foundCalendar?.length >= foundLocation.dayLimit) {
        throw new HttpErrors.BadRequest(foundLocation.name + " lokasyonuna ait günlük nöbet sınırı " + foundLocation.dayLimit + " adettir. Daha fazla kayıt atanamaz!");
      }
    }

  }
  /** Lokasyon gün sınırı için tarih aralığı dizisi oluşturuyor. */
  private async getDaysArray(start: Date, end: Date) {
    const addFn = Date.prototype.setDate;
    const interval = 1;
    let output = []
    let current = new Date(start);
    console.log(start)
    console.log(end)
    while (current <= end) {
      output.push(new Date(current));
      current = new Date(addFn.call(current, interval));
    }
    return output;
  }

  private async validateMessageSet(calendar: Calendar, user: User): Promise<string> {
    let message = "";
    switch (calendar.type) {
      case CalendarType.Nöbet:
        message = user.fullName + ' kullanıcısının bu tarihe ait nöbet kaydı bulunmaktadır. Kayıt atanamaz!'
        break;
      case CalendarType.Gebelik:
        message = user.fullName + ' kullanıcısının bu tarihe ait gebelik kaydı bulunmaktadır. Kayıt atanamaz!'
        break;
      case CalendarType.Rapor:
        message = user.fullName + ' kullanıcısının bu tarihe ait rapor kaydı bulunmaktadır. Kayıt atanamaz!'
        break;
      case CalendarType.ResmiTatil:
        message = user.fullName + ' kullanıcısının bu tarihe ait resmi tatil kaydı bulunmaktadır. Kayıt atanamaz!'
        break;
      case CalendarType.Rotasyon:
        message = user.fullName + ' kullanıcısının bu tarihe ait rotasyon kaydı bulunmaktadır. Kayıt atanamaz!'
        break;
      case CalendarType.ÖzelDurum:
        message = user.fullName + ' kullanıcısının bu tarihe ait özel durum kaydı bulunmaktadır. Kayıt atanamaz!'
        break;
      case CalendarType.İdariİzin:
        message = user.fullName + ' kullanıcısının bu tarihe ait idari izin kaydı bulunmaktadır. Kayıt atanamaz!'
        break;
      case CalendarType.İzin:
        message = user.fullName + ' kullanıcısının bu tarihe ait izin kaydı bulunmaktadır. Kayıt atanamaz!'
        break;
    }
    return message;
  }

  private async sequientalOrderLimitControlMessage(count: number, dayLimit: number, fullName: string): Promise<void> {
    if (count > dayLimit) {
      throw new HttpErrors.BadRequest(fullName + " kullanıcısına ait ardışık nöbet miktarı " + dayLimit + " ile sınırlıdır. Kayıt atanamaz!")
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
    if (!calendar.type) {
      calendar.type = foundCalendar.type;
    }
    if (!calendar.locationId) {
      calendar.locationId = foundCalendar.locationId;
    }
    return calendar;
  }

  async updateAll(calendar: Calendar, where?: Where<Calendar>): Promise<Count> {
    //await this.dataValidate(calendar, false, true, true);
    calendar.updatedDate = new Date();
    calendar.updatedUserId = this.currentUserProfile[securityId];
    return this.calendarRepository.updateAll(calendar, where);
  }

  async updateById(id: string, calendar: Calendar): Promise<void> {
    calendar = await this.updateValidateSet(id, calendar);
    await this.dataValidate(calendar, true, true, true, id);
    calendar.updatedDate = new Date();
    calendar.updatedUserId = this.currentUserProfile[securityId];
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
