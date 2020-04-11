import { bind, /* inject, */ BindingScope, inject } from '@loopback/core';
import { repository, Where, Count } from '@loopback/boot/node_modules/@loopback/repository';
import { UserSettingRepository } from '../repositories';
import { SecurityBindings, UserProfile, securityId } from '@loopback/authentication/node_modules/@loopback/security';
import { HttpErrors } from '@loopback/rest';
import { UserSetting } from '../models';

@bind({ scope: BindingScope.TRANSIENT })
export class UserSettingService {
  constructor(
    @repository(UserSettingRepository) private userSettingRepository: UserSettingRepository,
    @inject(SecurityBindings.USER) private currentUserProfile: UserProfile
  ) { }

  async create(userSetting: UserSetting): Promise<UserSetting> {
    userSetting.createdUserId = userSetting.updatedUserId = this.currentUserProfile[securityId];
    return this.userSettingRepository.create(userSetting);
  }

  async updateAll(userSetting: UserSetting, where?: Where<UserSetting>): Promise<Count> {
    userSetting.updatedDate = new Date();
    userSetting.updatedUserId = this.currentUserProfile[securityId];
    return this.userSettingRepository.updateAll(userSetting, where);
  }

  async updateById(id: string, userSetting: UserSetting): Promise<void> {
    userSetting.updatedDate = new Date();
    userSetting.updatedUserId = this.currentUserProfile[securityId];
    await this.userSettingRepository.updateById(id, userSetting);
  }

  async deleteById(id: string): Promise<void> {
    await this.userSettingRepository.updateAll({
      isDeleted: true,
      updatedDate: new Date(),
      updatedUserId: this.currentUserProfile[securityId]
    }, { id: id }).catch(ex => {
      throw new HttpErrors.NotFound(ex);
    });
  }
}
