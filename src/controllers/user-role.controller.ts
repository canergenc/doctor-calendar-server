import {
  Filter,
  repository,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getModelSchemaRef,
  del,
  requestBody,
} from '@loopback/rest';
import { UserRole } from '../models';
import { UserRoleRepository } from '../repositories';

export class UserRoleController {
  constructor(
    @repository(UserRoleRepository)
    public userRoleRepository: UserRoleRepository,
  ) { }

  @post('/user-roles', {
    responses: {
      '200': {
        description: 'UserRole model instance',
        content: { 'application/json': { schema: getModelSchemaRef(UserRole) } },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserRole, {
            title: 'NewUserRole',

          }),
        },
      },
    })
    userRole: UserRole,
  ): Promise<UserRole> {
    return this.userRoleRepository.create(userRole);
  }

  @get('/user-roles', {
    responses: {
      '200': {
        description: 'Array of UserRole model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(UserRole, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(UserRole)) filter?: Filter<UserRole>,
  ): Promise<UserRole[]> {
    return this.userRoleRepository.find(filter);
  }

  @get('/user-roles/{id}', {
    responses: {
      '200': {
        description: 'UserRole model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(UserRole, { includeRelations: true }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.query.object('filter', getFilterSchemaFor(UserRole)) filter?: Filter<UserRole>
  ): Promise<UserRole> {
    return this.userRoleRepository.findById(id, filter);
  }

  @post('/user-roles/{id}', {
    responses: {
      '200': {
        description: 'UserRole update success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserRole),
        },
      },
    })
    userRole: UserRole,
  ): Promise<void> {
    userRole.updateAt = new Date();
    await this.userRoleRepository.updateById(id, userRole);
  }

  @del('/user-roles/{id}', {
    responses: {
      '204': {
        description: 'UserRole DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.userRoleRepository.deleteById(id);
  }
}
