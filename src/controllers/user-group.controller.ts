import {
  Filter,
  repository,
  CountSchema,
  Where,
  Count,
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
import { UserGroup } from '../models';
import { UserGroupRepository } from '../repositories';
import { UserGroupService } from '../services';
import { service } from '@loopback/core';
import { authenticate } from '@loopback/authentication';

@authenticate('jwt')
export class UserGroupController {
  constructor(
    @service(UserGroupService) public userGroupService: UserGroupService,
    @repository(UserGroupRepository)
    public userGroupRepository: UserGroupRepository,
  ) { }

  @post('/user-groups', {
    responses: {
      '200': {
        description: 'UserGroup model instance',
        content: { 'application/json': { schema: getModelSchemaRef(UserGroup) } },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserGroup, {
            title: 'NewUserGroup',

          }),
        },
      },
    })
    userGroup: UserGroup,
  ): Promise<UserGroup> {
    return this.userGroupService.create(userGroup);
  }

  @get('/user-groups/count', {
    responses: {
      '200': {
        description: 'UserGroup model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(UserGroup)) where?: Where<UserGroup>,
  ): Promise<Count> {
    return this.userGroupRepository.count(where);
  }

  @get('/user-groups', {
    responses: {
      '200': {
        description: 'Array of UserGroup model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(UserGroup, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(UserGroup)) filter?: Filter<UserGroup>,
  ): Promise<UserGroup[]> {
    return this.userGroupRepository.find(filter);
  }

  @get('/user-groups/{id}', {
    responses: {
      '200': {
        description: 'UserGroup model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(UserGroup, { includeRelations: true }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.query.object('filter', getFilterSchemaFor(UserGroup)) filter?: Filter<UserGroup>
  ): Promise<UserGroup> {
    return this.userGroupRepository.findById(id, filter);
  }

  @del('/user-groups/{id}', {
    responses: {
      '204': {
        description: 'UserGroup DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.userGroupService.deleteById(id);
  }
}
