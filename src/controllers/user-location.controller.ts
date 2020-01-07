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
import {UserLocation} from '../models';
import {UserLocationRepository} from '../repositories';

export class UserLocationController {
  constructor(
    @repository(UserLocationRepository)
    public userLocationRepository : UserLocationRepository,
  ) {}

  @post('/user-locations', {
    responses: {
      '200': {
        description: 'UserLocation model instance',
        content: {'application/json': {schema: getModelSchemaRef(UserLocation)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserLocation, {
            title: 'NewUserLocation',
            exclude: ['Id'],
          }),
        },
      },
    })
    userLocation: Omit<UserLocation, 'Id'>,
  ): Promise<UserLocation> {
    return this.userLocationRepository.create(userLocation);
  }

  @get('/user-locations/count', {
    responses: {
      '200': {
        description: 'UserLocation model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(UserLocation)) where?: Where<UserLocation>,
  ): Promise<Count> {
    return this.userLocationRepository.count(where);
  }

  @get('/user-locations', {
    responses: {
      '200': {
        description: 'Array of UserLocation model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(UserLocation, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(UserLocation)) filter?: Filter<UserLocation>,
  ): Promise<UserLocation[]> {
    return this.userLocationRepository.find(filter);
  }

  @patch('/user-locations', {
    responses: {
      '200': {
        description: 'UserLocation PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserLocation, {partial: true}),
        },
      },
    })
    userLocation: UserLocation,
    @param.query.object('where', getWhereSchemaFor(UserLocation)) where?: Where<UserLocation>,
  ): Promise<Count> {
    return this.userLocationRepository.updateAll(userLocation, where);
  }

  @get('/user-locations/{id}', {
    responses: {
      '200': {
        description: 'UserLocation model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(UserLocation, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.query.object('filter', getFilterSchemaFor(UserLocation)) filter?: Filter<UserLocation>
  ): Promise<UserLocation> {
    return this.userLocationRepository.findById(id, filter);
  }

  @patch('/user-locations/{id}', {
    responses: {
      '204': {
        description: 'UserLocation PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserLocation, {partial: true}),
        },
      },
    })
    userLocation: UserLocation,
  ): Promise<void> {
    await this.userLocationRepository.updateById(id, userLocation);
  }

  @put('/user-locations/{id}', {
    responses: {
      '204': {
        description: 'UserLocation PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() userLocation: UserLocation,
  ): Promise<void> {
    await this.userLocationRepository.replaceById(id, userLocation);
  }

  @del('/user-locations/{id}', {
    responses: {
      '204': {
        description: 'UserLocation DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.userLocationRepository.deleteById(id);
  }
}
