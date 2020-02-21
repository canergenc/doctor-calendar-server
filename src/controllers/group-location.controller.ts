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
import { GroupLocation } from '../models';
import { GroupLocationRepository } from '../repositories';

export class GroupLocationController {
  constructor(
    @repository(GroupLocationRepository)
    public groupLocationRepository: GroupLocationRepository,
  ) { }

  @post('/group-locations', {
    responses: {
      '200': {
        description: 'GroupLocation model instance',
        content: { 'application/json': { schema: getModelSchemaRef(GroupLocation) } },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(GroupLocation, {
            title: 'NewGroupLocation',

          }),
        },
      },
    })
    groupLocation: GroupLocation,
  ): Promise<GroupLocation> {
    return this.groupLocationRepository.create(groupLocation);
  }

  @get('/group-locations', {
    responses: {
      '200': {
        description: 'Array of GroupLocation model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(GroupLocation, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(GroupLocation)) filter?: Filter<GroupLocation>,
  ): Promise<GroupLocation[]> {
    return this.groupLocationRepository.find(filter);
  }

  @get('/group-locations/{id}', {
    responses: {
      '200': {
        description: 'GroupLocation model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(GroupLocation, { includeRelations: true }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.query.object('filter', getFilterSchemaFor(GroupLocation)) filter?: Filter<GroupLocation>
  ): Promise<GroupLocation> {
    return this.groupLocationRepository.findById(id, filter);
  }

  @post('/group-locations/{id}', {
    responses: {
      '200': {
        description: 'GroupLocation update success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(GroupLocation),
        },
      },
    }) groupLocation: GroupLocation,
  ): Promise<void> {
    await this.groupLocationRepository.replaceById(id, groupLocation);
  }

  @del('/group-locations/{id}', {
    responses: {
      '204': {
        description: 'GroupLocation DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.groupLocationRepository.deleteById(id);
  }
}
