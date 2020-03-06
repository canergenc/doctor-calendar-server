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
} from '@loopback/rest';
import { Group } from '../models';
import { GroupRepository } from '../repositories';
import { service } from '@loopback/core';
import { GroupService } from '../services';
import { authenticate } from '@loopback/authentication';

@authenticate('jwt')
export class GroupController {
  constructor(
    @service(GroupService) public groupService: GroupService,
    @repository(GroupRepository)
    public groupRepository: GroupRepository,
  ) { }

  @post('/groups', {
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

  @post('/groups/{id}', {
    responses: {
      '200': {
        description: 'Group update success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Group),
        },
      },
    }) group: Group,
  ): Promise<void> {
    group.updatedDate = new Date();
    await this.groupService.updateById(id, group);
  }

  @del('/groups/{id}', {
    responses: {
      '204': {
        description: 'Group DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.groupRepository.deleteById(id);
  }
}
