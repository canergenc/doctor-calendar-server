import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  UserGroup,
  Group,
} from '../models';
import {UserGroupRepository} from '../repositories';

export class UserGroupGroupController {
  constructor(
    @repository(UserGroupRepository)
    public userGroupRepository: UserGroupRepository,
  ) { }

  @get('/user-groups/{id}/group', {
    responses: {
      '200': {
        description: 'Group belonging to UserGroup',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Group)},
          },
        },
      },
    },
  })
  async getGroup(
    @param.path.string('id') id: typeof UserGroup.prototype.id,
  ): Promise<Group> {
    return this.userGroupRepository.group(id);
  }
}
