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
import { UserLocation } from '../models';
import { UserLocationRepository } from '../repositories';

export class UserLocationController {
  constructor(
    @repository(UserLocationRepository)
    public userLocationRepository: UserLocationRepository,
  ) { }

  @post('/user-locations', {
    responses: {
      '200': {
        description: 'UserLocation model instance',
        content: { 'application/json': { schema: getModelSchemaRef(UserLocation) } },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserLocation, {
            title: 'NewUserLocation',

          }),
        },
      },
    })
    userLocation: UserLocation,
  ): Promise<UserLocation> {
    return this.userLocationRepository.create(userLocation);
  }

  @get('/user-locations', {
    responses: {
      '200': {
        description: 'Array of UserLocation model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(UserLocation, { includeRelations: true }),
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

  @get('/user-locations/{id}', {
    responses: {
      '200': {
        description: 'UserLocation model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(UserLocation),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.query.object('filter', getFilterSchemaFor(UserLocation)) filter?: Filter<UserLocation>
  ): Promise<UserLocation> {
    return this.userLocationRepository.findById(id, filter);
  }

  @post('/user-locations/{id}', {
    responses: {
      '200': {
        description: 'UserLocation update success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserLocation),
        },
      },
    })
    userLocation: UserLocation,
  ): Promise<void> {
    await this.userLocationRepository.updateById(id, userLocation);
  }

  @del('/user-locations/{id}', {
    responses: {
      '204': {
        description: 'UserLocation DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.userLocationRepository.deleteById(id);
  }
}
