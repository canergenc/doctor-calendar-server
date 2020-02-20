import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getModelSchemaRef,
  getWhereSchemaFor,
  patch,
  put,
  del,
  requestBody,
} from '@loopback/rest';
import {GroupLocation} from '../models';
import {GroupLocationRepository} from '../repositories';

export class GroupLocationController {
  constructor(
    @repository(GroupLocationRepository)
    public groupLocationRepository : GroupLocationRepository,
  ) {}

  @post('/group-locations', {
    responses: {
      '200': {
        description: 'GroupLocation model instance',
        content: {'application/json': {schema: getModelSchemaRef(GroupLocation)}},
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

  @get('/group-locations/count', {
    responses: {
      '200': {
        description: 'GroupLocation model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(GroupLocation)) where?: Where<GroupLocation>,
  ): Promise<Count> {
    return this.groupLocationRepository.count(where);
  }

  @get('/group-locations', {
    responses: {
      '200': {
        description: 'Array of GroupLocation model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(GroupLocation, {includeRelations: true}),
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

  @patch('/group-locations', {
    responses: {
      '200': {
        description: 'GroupLocation PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(GroupLocation, {partial: true}),
        },
      },
    })
    groupLocation: GroupLocation,
    @param.query.object('where', getWhereSchemaFor(GroupLocation)) where?: Where<GroupLocation>,
  ): Promise<Count> {
    return this.groupLocationRepository.updateAll(groupLocation, where);
  }

  @get('/group-locations/{id}', {
    responses: {
      '200': {
        description: 'GroupLocation model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(GroupLocation, {includeRelations: true}),
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

  @patch('/group-locations/{id}', {
    responses: {
      '204': {
        description: 'GroupLocation PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(GroupLocation, {partial: true}),
        },
      },
    })
    groupLocation: GroupLocation,
  ): Promise<void> {
    await this.groupLocationRepository.updateById(id, groupLocation);
  }

  @put('/group-locations/{id}', {
    responses: {
      '204': {
        description: 'GroupLocation PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() groupLocation: GroupLocation,
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
