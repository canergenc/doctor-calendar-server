import {
  Filter,
  repository
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
import { Group } from '../models';
import { GroupRepository } from '../repositories';

export class GroupController {
  constructor(
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
    return this.groupRepository.create(group);
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
    group.updateAt = new Date();
    await this.groupRepository.updateById(id, group);
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
