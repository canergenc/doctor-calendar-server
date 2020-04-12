import { bind, BindingScope, inject } from '@loopback/core';
import { UserProfile, securityId, SecurityBindings } from '@loopback/security';
import { GroupSettingRepository } from '../repositories';
import { repository, Where, Count } from '@loopback/repository';
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

  async validateControl(groupSetting: GroupSetting): Promise<void> {
    const foundGroupSetting = await this.groupSettingRepository.findOne({ where: { groupId: { like: groupSetting.groupId } } })
    if (foundGroupSetting) {
      throw new HttpErrors.BadRequest("Bu gruba ait daha önce ayar kayıt edilmiş! Kayıt atılamaz!")
    }
  }

  async uniqueGroupValidate(groupSetting: GroupSetting): Promise<void> {
    if (groupSetting.groupId) {
      delete groupSetting.groupId
    }
  }

  async updateAll(groupSetting: GroupSetting, where?: Where<GroupSetting>): Promise<Count> {
    await this.uniqueGroupValidate(groupSetting);
    groupSetting.updatedDate = new Date();
    groupSetting.updatedUserId = this.currentUserProfile[securityId];
    return this.groupSettingRepository.updateAll(groupSetting, where);
  }

  async updateById(id: string, groupSetting: GroupSetting): Promise<void> {
    await this.uniqueGroupValidate(groupSetting);
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
