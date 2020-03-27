import {
  Filter,
  repository,
  Count,
  Where,
  CountSchema,
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
  patch,
} from '@loopback/rest';
import { Role } from '../models';
import { RoleRepository } from '../repositories';
import { service } from '@loopback/core';
import { RoleService } from '../services';
import { authenticate } from '@loopback/authentication';
import { OPERATION_SECURITY_SPEC } from '../utils/security-spec';

@authenticate('jwt')
export class RoleController {
  constructor(
    @service(RoleService) public roleService: RoleService,
    @repository(RoleRepository)
    public roleRepository: RoleRepository,
  ) { }

  @post('/roles', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Role model instance',
        content: { 'application/json': { schema: getModelSchemaRef(Role) } },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Role, {
            title: 'NewRole',

          }),
        },
      },
    })
    role: Role,
  ): Promise<Role> {
    return this.roleService.create(role);
  }

  @get('/roles/count', {
    responses: {
      '200': {
        description: 'Role model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Role)) where?: Where<Role>,
  ): Promise<Count> {
    return this.roleRepository.count(where);
  }

  @get('/roles', {
    responses: {
      '200': {
        description: 'Array of Role model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Role, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Role)) filter?: Filter<Role>,
  ): Promise<Role[]> {
    return this.roleRepository.find(filter);
  }

  @get('/roles/{id}', {
    responses: {
      '200': {
        description: 'Role model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Role, { includeRelations: true }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.query.object('filter', getFilterSchemaFor(Role)) filter?: Filter<Role>
  ): Promise<Role> {
    return this.roleRepository.findById(id, filter);
  }

  @patch('/roles', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Role PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Role, { partial: true }),
        },
      },
    })
    role: Role,
    @param.query.object('where', getWhereSchemaFor(Role))
    where?: Where<Role>,
  ): Promise<Count> {
    return this.roleRepository.updateAll(role, where);
  }

  @patch('/roles/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Role patch success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Role),
        },
      },
    })
    role: Role,
  ): Promise<void> {
    await this.roleService.updateById(id, role);
  }

  @del('/roles/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Role DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.roleService.deleteById(id);
  }
}
