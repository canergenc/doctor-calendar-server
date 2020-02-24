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
  Role,
} from '../models';
import {UserRoleRepository} from '../repositories';

export class UserRoleRoleController {
  constructor(
    @repository(UserRoleRepository)
    public userRoleRepository: UserRoleRepository,
  ) { }

  @get('/user-roles/{id}/role', {
    responses: {
      '200': {
        description: 'Role belonging to UserRole',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Role)},
          },
        },
      },
    },
  })
  async getRole(
    @param.path.string('id') id: typeof UserRole.prototype.id,
  ): Promise<Role> {
    return this.userRoleRepository.role(id);
  }
}
