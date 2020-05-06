import { bind, /* inject, */ BindingScope, inject } from '@loopback/core';
import { UserGroup } from '../models';
import { UserGroupRepository, UserRepository, GroupRepository } from '../repositories';
import { SecurityBindings, UserProfile, securityId } from '@loopback/security';
import { repository, Count, Where } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';

@bind({ scope: BindingScope.TRANSIENT })
export class UserGroupService {
  constructor(
    @repository(UserGroupRepository) public userGroupRepository: UserGroupRepository,
    @repository(GroupRepository) public groupRepository: GroupRepository,
    @repository(UserRepository) public userRepository: UserRepository,
    @inject(SecurityBindings.USER) public currentUserProfile: UserProfile
  ) { }

  async create(userGroup: UserGroup): Promise<UserGroup> {

    /*audit set*/
    userGroup.createdUserId = userGroup.updatedUserId = this.currentUserProfile[securityId];
    delete this.currentUserProfile[securityId];

    /*Data Control*/
    await this.validate(userGroup);

    return this.userGroupRepository.create(userGroup);
  }

  async createBulk(userGroups: UserGroup[]): Promise<UserGroup[]> {
    try {
      for (const userGroup of userGroups) {
        userGroup.createdUserId = userGroup.updatedUserId = this.currentUserProfile[securityId];
        /*Data Control*/
        await this.validate(userGroup);
      }
      return await this.userGroupRepository.createAll(userGroups);
    } catch (error) {
      throw new HttpErrors.BadRequest(error.message);
    }
  }

  async duplicateValidate(userGroup: UserGroup, id?: string): Promise<void> {
    /*Duplicate Data Control*/
    let foundDuplicateData = await this.userGroupRepository.findOne({ where: { userId: { like: userGroup.userId }, groupId: { like: userGroup.groupId } } });

    if (id)
      foundDuplicateData = await this.userGroupRepository.findOne({ where: { id: { neq: id }, userId: { like: userGroup.userId }, groupId: { like: userGroup.groupId } } });

    if (foundDuplicateData) {
      const foundUser = await this.userRepository.findById(userGroup.userId);
      const foundGroup = await this.groupRepository.findById(userGroup.groupId);
      if (foundUser && foundGroup)
        throw new HttpErrors.BadRequest(foundUser.fullName + ' kullanıcısı ' + foundGroup.name + " grubuna daha önce eklenmiş!");

      throw new HttpErrors.BadRequest("İlgili kullanıcı ilgili gruba daha önce eklenmiş!");
    }

  }

  async limitValidate(userGroup: UserGroup): Promise<void> {
    /** Count Limit Control */

    if (userGroup.weekdayCountLimit && userGroup.weekdayCountLimit < 0 || userGroup.weekendCountLimit && userGroup.weekendCountLimit < 0) {
      throw new HttpErrors.BadRequest("Limit minimum 0 girilebilir!");
    }
  }

  async validate(userGroup: UserGroup, id?: string, ): Promise<void> {
    await this.duplicateValidate(userGroup, id);
    await this.limitValidate(userGroup);
  }

  private async updateValidateSet(id: string, userGroup: UserGroup): Promise<UserGroup> {
    const foundUserGroup = await this.userGroupRepository.findById(id);

    if (!foundUserGroup.groupId) {
      userGroup.groupId = foundUserGroup.groupId;
    }
    if (!foundUserGroup.userId) {
      userGroup.userId = foundUserGroup.userId;
    }
    return userGroup;
  }

  async updateById(id: string, userGroup: UserGroup): Promise<void> {
    userGroup.updatedDate = new Date();
    userGroup.updatedUserId = this.currentUserProfile[securityId];
    await this.updateValidateSet(id, userGroup);
    await this.validate(userGroup, id);
    await this.userGroupRepository.updateById(id, userGroup);
  }

  async updateAll(userGroup: UserGroup, where?: Where<UserGroup>): Promise<Count> {
    userGroup.updatedDate = new Date();
    userGroup.updatedUserId = this.currentUserProfile[securityId];
    return this.userGroupRepository.updateAll(userGroup, where);
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
