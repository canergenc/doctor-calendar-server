import { bind, BindingScope, inject } from '@loopback/core';
import { repository } from '@loopback/repository';
import { RoleRepository } from '../repositories';
import { UserProfile, securityId, SecurityBindings } from '@loopback/security';
import { Role } from '../models';

@bind({ scope: BindingScope.TRANSIENT })
export class RoleService {

  constructor(
    @repository(RoleRepository) public roleRepository: RoleRepository,
    @inject(SecurityBindings.USER) public currentUserProfile: UserProfile
  ) { }

  async create(role: Role): Promise<Role> {
    role.createdUserId = role.updatedUserId = this.currentUserProfile[securityId];
    delete this.currentUserProfile[securityId];
    return this.roleRepository.create(role);
  }

  async updateById(id: string, role: Role): Promise<void> {
    role.updatedDate = new Date();
    role.updatedUserId = this.currentUserProfile[securityId];
    delete this.currentUserProfile[securityId];
    await this.roleRepository.updateById(id, role);
  }
}
