import { bind, /* inject, */ BindingScope, inject } from '@loopback/core';
import { UserGroup } from '../models';
import { UserGroupRepository } from '../repositories';
import { SecurityBindings, UserProfile, securityId } from '@loopback/security';
import { repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';

@bind({ scope: BindingScope.TRANSIENT })
export class UserGroupService {
  constructor(
    @repository(UserGroupRepository) public userGroupRepository: UserGroupRepository,
    @inject(SecurityBindings.USER) public currentUserProfile: UserProfile
  ) { }

  async create(userGroup: UserGroup): Promise<UserGroup> {

    /*audit set*/
    userGroup.createdUserId = userGroup.updatedUserId = this.currentUserProfile[securityId];
    delete this.currentUserProfile[securityId];

    /*Duplicate Data Control*/
    const foundDuplicateData = await this.userGroupRepository.find({ where: { userId: { like: userGroup.userId }, groupId: { like: userGroup.groupId } } });

    if (foundDuplicateData && foundDuplicateData.length > 0) throw new HttpErrors.BadRequest('Daha önce ilişkilendirme yapılmış!');

    return this.userGroupRepository.create(userGroup);
  }

  async createBulk(userGroups: UserGroup[]): Promise<UserGroup[]> {
    try {
      for (const userGroup of userGroups) {
        userGroup.createdUserId = userGroup.updatedUserId = this.currentUserProfile[securityId];
      }
      return await this.userGroupRepository.createAll(userGroups);
    } catch (error) {
      throw new HttpErrors.BadRequest(error.message);
    }
  }

  async updateById(id: string, userGroup: UserGroup): Promise<void> {
    userGroup.updatedDate = new Date();
    userGroup.updatedUserId = this.currentUserProfile[securityId];
    delete this.currentUserProfile[securityId];
    await this.userGroupRepository.updateById(id, userGroup);
  }

  async deleteById(id: string): Promise<void> {
    await this.userGroupRepository.updateAll({
      isDeleted: true,
      updatedDate: new Date(),
      updatedUserId: this.currentUserProfile[securityId]
    }, { id: id }).catch(ex => {
      throw new HttpErrors.NotFound(ex);
    });
  }
}
