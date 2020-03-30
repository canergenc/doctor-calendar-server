import { bind, BindingScope, inject } from '@loopback/core';
import { repository, Where, Count } from '@loopback/repository';
import { RoleRepository } from '../repositories';
import { UserProfile, securityId, SecurityBindings } from '@loopback/security';
import { Role } from '../models';
import { HttpErrors } from '@loopback/rest';

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

  async updateAll(role: Role, where?: Where<Role>): Promise<Count> {
    role.updatedDate = new Date();
    role.updatedUserId = this.currentUserProfile[securityId];
    return this.roleRepository.updateAll(role, where);
  }

  async updateById(id: string, role: Role): Promise<void> {
    role.updatedDate = new Date();
    role.updatedUserId = this.currentUserProfile[securityId];
    delete this.currentUserProfile[securityId];
    await this.roleRepository.updateById(id, role);
  }

  async deleteById(id: string): Promise<void> {
    await this.roleRepository.updateAll({
      isDeleted: true,
      updatedDate: new Date(),
      updatedUserId: this.currentUserProfile[securityId]
    }, { id: id }).catch(ex => {
      throw new HttpErrors.NotFound(ex);
    });
  }
}
