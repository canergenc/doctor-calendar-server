import { bind, /* inject, */ BindingScope, inject } from '@loopback/core';
import { Group } from '../models';
import { GroupRepository, UserGroupRepository, LocationRepository } from '../repositories';
import { SecurityBindings, UserProfile, securityId } from '@loopback/security';
import { repository, Where, Count } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';

@bind({ scope: BindingScope.TRANSIENT })
export class GroupService {
  constructor(
    @repository(GroupRepository) public groupRepository: GroupRepository,
    @repository(UserGroupRepository) public userGroupRepository: UserGroupRepository,
    @repository(LocationRepository) public locationRepository: LocationRepository,
    @inject(SecurityBindings.USER) public currentUserProfile: UserProfile
  ) { }

  async create(group: Group): Promise<Group> {
    group.createdUserId = group.updatedUserId = this.currentUserProfile[securityId];
    delete this.currentUserProfile[securityId];
    return this.groupRepository.create(group);
  }

  async updateById(id: string, group: Group): Promise<void> {
    group.updatedDate = new Date();
    group.updatedUserId = this.currentUserProfile[securityId];
    delete this.currentUserProfile[securityId];
    await this.groupRepository.updateById(id, group);
  }

  async updateAll(group: Group, where?: Where<Group>): Promise<Count> {
    group.updatedDate = new Date();
    group.updatedUserId = this.currentUserProfile[securityId];
    return this.groupRepository.updateAll(group, where);
  }

  async deleteById(groupId: string): Promise<void> {

    await this.groupRepository.updateAll({ isDeleted: true }, { id: groupId }).then(async () => {

      //#region User Group Delete
      await this.userGroupRepository.updateAll({ isDeleted: true }, { groupId: { like: groupId } });
      //#endregion

      //#region Location Delete
      await this.locationRepository.updateAll({ isDeleted: true }, { groupId: { like: groupId } });
      //#endregion

    }).catch(ex => {
      throw new HttpErrors.NotFound(ex);
    });
  }
}
