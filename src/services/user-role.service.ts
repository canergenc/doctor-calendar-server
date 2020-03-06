import { bind, BindingScope, inject } from '@loopback/core';
import { UserRoleRepository } from '../repositories';
import { UserProfile, SecurityBindings, securityId } from '@loopback/security';
import { repository } from '@loopback/repository';
import { UserRole } from '../models';

@bind({ scope: BindingScope.TRANSIENT })
export class UserRoleService {

  constructor(
    @repository(UserRoleRepository) public userRoleRepository: UserRoleRepository,
    @inject(SecurityBindings.USER) public currentUserProfile: UserProfile
  ) { }

  async create(userRole: UserRole): Promise<UserRole> {
    userRole.createdUserId = userRole.updatedUserId = this.currentUserProfile[securityId];
    delete this.currentUserProfile[securityId];
    return this.userRoleRepository.create(userRole);
  }

  async updateById(id: string, userRole: UserRole): Promise<void> {
    userRole.updatedDate = new Date();
    userRole.updatedUserId = this.currentUserProfile[securityId];
    delete this.currentUserProfile[securityId];
    await this.userRoleRepository.updateById(id, userRole);
  }
}
