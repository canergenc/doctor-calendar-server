import { bind, BindingScope, inject } from '@loopback/core';
import { SecurityBindings, securityId, UserProfile } from '@loopback/authentication/node_modules/@loopback/security';
import { GroupSettingRepository } from '../repositories';
import { repository, Where, Count } from '@loopback/boot/node_modules/@loopback/repository';
import { GroupSetting } from '../models';
import { HttpErrors } from '@loopback/rest';

@bind({ scope: BindingScope.TRANSIENT })
export class GroupSettingService {
  constructor(
    @repository(GroupSettingRepository) private groupSettingRepository: GroupSettingRepository,
    @inject(SecurityBindings.USER) private currentUserProfile: UserProfile
  ) { }

  async create(groupSetting: GroupSetting): Promise<GroupSetting> {
    groupSetting.createdUserId = groupSetting.updatedUserId = this.currentUserProfile[securityId];
    return this.groupSettingRepository.create(groupSetting);
  }

  async updateAll(groupSetting: GroupSetting, where?: Where<GroupSetting>): Promise<Count> {
    groupSetting.updatedDate = new Date();
    groupSetting.updatedUserId = this.currentUserProfile[securityId];
    return this.groupSettingRepository.updateAll(groupSetting, where);
  }

  async updateById(id: string, groupSetting: GroupSetting): Promise<void> {
    groupSetting.updatedDate = new Date();
    groupSetting.updatedUserId = this.currentUserProfile[securityId];
    await this.groupSettingRepository.updateById(id, groupSetting);
  }

  async deleteById(id: string): Promise<void> {
    await this.groupSettingRepository.updateAll({
      isDeleted: true,
      updatedDate: new Date(),
      updatedUserId: this.currentUserProfile[securityId]
    }, { id: id }).catch(ex => {
      throw new HttpErrors.NotFound(ex);
    });
  }
}
