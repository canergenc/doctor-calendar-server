import { bind, BindingScope, inject } from '@loopback/core';
import { UserRoleRepository } from '../repositories';
import { UserProfile, SecurityBindings, securityId } from '@loopback/security';
import { repository } from '@loopback/repository';
import { UserRole } from '../models';
import { HttpErrors } from '@loopback/rest';

@bind({ scope: BindingScope.TRANSIENT })
export class UserRoleService {

  constructor(
    @repository(UserRoleRepository) public userRoleRepository: UserRoleRepository,
    @inject(SecurityBindings.USER) public currentUserProfile: UserProfile
  ) { }

  async create(userRole: UserRole): Promise<UserRole> {
    /*audit set*/
    userRole.createdUserId = userRole.updatedUserId = this.currentUserProfile[securityId];
    delete this.currentUserProfile[securityId];

    /*Duplicate Data Control*/
    const foundDuplicateData = this.userRoleRepository.find({ where: { userId: { like: userRole.userId }, roleId: { like: userRole.roleId } } });
    if (foundDuplicateData)
      throw new HttpErrors.BadRequest('Daha önce ilişkilendirme yapılmış!');

    return this.userRoleRepository.create(userRole);
  }
}
