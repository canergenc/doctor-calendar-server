import {
  Filter,
  repository,
  CountSchema,
  Where,
  Count
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
import { Group } from '../models';
import { GroupRepository } from '../repositories';
import { service } from '@loopback/core';
import { GroupService } from '../services';
import { authenticate } from '@loopback/authentication';
import { OPERATION_SECURITY_SPEC } from '../utils/security-spec';

@authenticate('jwt')
export class GroupController {
  constructor(
    @service(GroupService) public groupService: GroupService,
    @repository(GroupRepository)
    public groupRepository: GroupRepository,
  ) { }

  @post('/groups', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Group model instance',
        content: { 'application/json': { schema: getModelSchemaRef(Group) } },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Group, {
            title: 'NewGroup',

          }),
        },
      },
    })
    group: Group,
  ): Promise<Group> {
    return this.groupService.create(group);
  }

  @get('/groups/count', {
    responses: {
      '200': {
        description: 'Group model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Group)) where?: Where<Group>,
  ): Promise<Count> {
    return this.groupRepository.count(where);
  }

  @get('/groups', {
    responses: {
      '200': {
        description: 'Array of Group model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Group, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Group)) filter?: Filter<Group>,
  ): Promise<Group[]> {
    return this.groupRepository.find(filter);
  }

  @get('/groups/{id}', {
    responses: {
      '200': {
        description: 'Group model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Group, { includeRelations: true }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.query.object('filter', getFilterSchemaFor(Group)) filter?: Filter<Group>
  ): Promise<Group> {
    return this.groupRepository.findById(id, filter);
  }

  @patch('/groups', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Group PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Group, { partial: true }),
        },
      },
    })
    group: Group,
    @param.query.object('where', getWhereSchemaFor(Group))
    where?: Where<Group>,
  ): Promise<Count> {
    return this.groupService.updateAll(group, where);
  }

  @patch('/groups/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Group patch success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Group, { partial: true }),
        },
      },
    }) group: Group,
  ): Promise<void> {
    group.updatedDate = new Date();
    await this.groupService.updateById(id, group);
  }

  @del('/groups/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Group DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.groupService.deleteById(id);
  }
}
