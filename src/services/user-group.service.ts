import { bind, /* inject, */ BindingScope, inject } from '@loopback/core';
import { UserGroup } from '../models';
import { UserGroupRepository } from '../repositories';
import { SecurityBindings, UserProfile, securityId } from '@loopback/security';
import { repository } from '@loopback/repository';

@bind({ scope: BindingScope.TRANSIENT })
export class UserGroupService {
  constructor(
    @repository(UserGroupRepository) public userGroupRepository: UserGroupRepository,
    @inject(SecurityBindings.USER) public currentUserProfile: UserProfile
  ) { }

  async create(userGroup: UserGroup): Promise<UserGroup> {
    userGroup.createdUserId = userGroup.updatedUserId = this.currentUserProfile[securityId];
    delete this.currentUserProfile[securityId];
    return this.userGroupRepository.create(userGroup);
  }

  async updateById(id: string, userGroup: UserGroup): Promise<void> {
    userGroup.updatedDate = new Date();
    userGroup.updatedUserId = this.currentUserProfile[securityId];
    delete this.currentUserProfile[securityId];
    await this.userGroupRepository.updateById(id, userGroup);
  }
}
