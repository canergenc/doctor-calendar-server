import {
  Filter,
  repository,
  CountSchema,
  Count,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getModelSchemaRef,
  del,
  requestBody,
  getWhereSchemaFor,
} from '@loopback/rest';
import { UserRole } from '../models';
import { UserRoleRepository } from '../repositories';
import { service } from '@loopback/core';
import { UserRoleService } from '../services';
import { authenticate } from '@loopback/authentication';

@authenticate('jwt')
export class UserRoleController {
  constructor(
    @service(UserRoleService) public userRoleService: UserRoleService,
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
    return this.userRoleService.create(userRole);
  }

  @get('/user-roles/count', {
    responses: {
      '200': {
        description: 'UserRole model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(UserRole)) where?: Where<UserRole>,
  ): Promise<Count> {
    return this.userRoleRepository.count(where);
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

  @del('/user-roles/{id}', {
    responses: {
      '204': {
        description: 'UserRole DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.userRoleService.deleteById(id);
  }
}
