import { bind, /* inject, */ BindingScope, inject } from '@loopback/core';
import { Group } from '../models';
import { GroupRepository } from '../repositories';
import { SecurityBindings, UserProfile, securityId } from '@loopback/security';
import { repository } from '@loopback/repository';

@bind({ scope: BindingScope.TRANSIENT })
export class GroupService {
  constructor(
    @repository(GroupRepository) public groupRepository: GroupRepository,
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
}
