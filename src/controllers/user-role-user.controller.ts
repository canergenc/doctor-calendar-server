import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  UserRole,
  User,
} from '../models';
import {UserRoleRepository} from '../repositories';

export class UserRoleUserController {
  constructor(
    @repository(UserRoleRepository)
    public userRoleRepository: UserRoleRepository,
  ) { }

  @get('/user-roles/{id}/user', {
    responses: {
      '200': {
        description: 'User belonging to UserRole',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(User)},
          },
        },
      },
    },
  })
  async getUser(
    @param.path.string('id') id: typeof UserRole.prototype.id,
  ): Promise<User> {
    return this.userRoleRepository.user(id);
  }
}
