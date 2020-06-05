import { bind, BindingScope, inject } from '@loopback/core';
import { UserProfile, securityId, SecurityBindings } from '@loopback/security';
import { GroupSettingRepository, UserGroupRepository } from '../repositories';
import { repository, Where, Count } from '@loopback/repository';
import { GroupSetting } from '../models';
import { HttpErrors } from '@loopback/rest';

@bind({ scope: BindingScope.TRANSIENT })
export class GroupSettingService {
  constructor(
    @repository(GroupSettingRepository) private groupSettingRepository: GroupSettingRepository,
    @repository(UserGroupRepository) private userGroupRepository: UserGroupRepository,
    @inject(SecurityBindings.USER) private currentUserProfile: UserProfile
  ) { }

  async create(groupSetting: GroupSetting): Promise<GroupSetting> {
    groupSetting.createdUserId = groupSetting.updatedUserId = this.currentUserProfile[securityId];
    await this.userGroupRelationControl(groupSetting);
    //await this.validateControl(groupSetting);
    return this.groupSettingRepository.create(groupSetting);
  }

  async validateControl(groupSetting: GroupSetting, id?: string): Promise<void> {
    if (!groupSetting.groupId) throw new HttpErrors.BadRequest('Lütfen grup belirtiniz. Kayıt atanamaz!');
    let foundGroupSetting = await this.groupSettingRepository.findOne({ where: { groupId: { like: groupSetting.groupId }, type: groupSetting.type } });
    if (id)
      foundGroupSetting = await this.groupSettingRepository.findOne({ where: { groupId: { like: groupSetting.groupId }, type: groupSetting.type, id: { neq: id } } });

    if (foundGroupSetting) {
      throw new HttpErrors.BadRequest("Bu gruba ait daha önce ayar kayıt edilmiş! Kayıt atılamaz!")
    }
  }

  private async userGroupRelationControl(groupSetting: GroupSetting): Promise<void> {
    if (!groupSetting.groupId) throw new HttpErrors.BadRequest('Lütfen grup belirtiniz. Kayıt atanamaz!');
    const foundUserGroup = await this.userGroupRepository.findOne({ where: { userId: { like: this.currentUserProfile[securityId] }, groupId: { like: groupSetting.groupId } } });
    if (!foundUserGroup) {
      throw new HttpErrors.BadRequest('İlgili kullanıcının bu gruba ait ilişki bulunmamaktadır. Kayıt atanamaz!');
    }
  }

  private async updateValidateSet(id: string, groupSetting: GroupSetting): Promise<GroupSetting> {
    const foundGroupSetting = await this.groupSettingRepository.findById(id);
    if (!groupSetting.type) {
      groupSetting.type = foundGroupSetting.type;
    }
    if (!groupSetting.groupId) {
      groupSetting.groupId = foundGroupSetting.groupId;
    }
    return groupSetting;
  }

  async updateAll(groupSetting: GroupSetting, where?: Where<GroupSetting>): Promise<Count> {
    groupSetting.updatedDate = new Date();
    groupSetting.updatedUserId = this.currentUserProfile[securityId];
    return this.groupSettingRepository.updateAll(groupSetting, where);
  }

  async updateById(id: string, groupSetting: GroupSetting): Promise<void> {
    groupSetting.updatedDate = new Date();
    groupSetting.updatedUserId = this.currentUserProfile[securityId];
    groupSetting = await this.updateValidateSet(id, groupSetting);
    await this.userGroupRelationControl(groupSetting);
    //await this.validateControl(groupSetting);
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
