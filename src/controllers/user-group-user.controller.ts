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
  User,
} from '../models';
import {UserGroupRepository} from '../repositories';

export class UserGroupUserController {
  constructor(
    @repository(UserGroupRepository)
    public userGroupRepository: UserGroupRepository,
  ) { }

  @get('/user-groups/{id}/user', {
    responses: {
      '200': {
        description: 'User belonging to UserGroup',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(User)},
          },
        },
      },
    },
  })
  async getUser(
    @param.path.string('id') id: typeof UserGroup.prototype.id,
  ): Promise<User> {
    return this.userGroupRepository.user(id);
  }
}
