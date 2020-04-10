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
import { Location } from '../models';
import { LocationRepository } from '../repositories';
import { service } from '@loopback/core';
import { LocationService } from '../services';
import { authenticate } from '@loopback/authentication';
import { OPERATION_SECURITY_SPEC } from '../utils/security-spec';

@authenticate('jwt')
export class LocationController {
  constructor(
    @service(LocationService) public locationService: LocationService,
    @repository(LocationRepository) public locationRepository: LocationRepository,
  ) { }

  @post('/locations', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Location model instance',
        content: { 'application/json': { schema: getModelSchemaRef(Location) } },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Location, {
            title: 'NewLocation',
          }),
        },
      },
    })
    location: Location,
  ): Promise<Location> {
    return this.locationService.create(location);
  }

  @post('/locations/bulk', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Locations model instance',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                'x-ts-type': Location,
              },
            }
          }
        },
      },
    },
  })
  async createBulk(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              'x-ts-type': Location,
            },
          }
        }
      },
    })
    locations: Location[],
  ): Promise<Location[]> {
    return this.locationService.createBulk(locations);
  }

  @patch('/locations/bulk', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Locations patch success'
      },
    },
  })
  async updateBulk(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: getModelSchemaRef(Location, { partial: true })
          }
        }
      },
    })
    locations: Location[],
  ): Promise<void> {
    await this.locationService.updateBulk(locations);
  }

  @get('/locations/count', {
    responses: {
      '200': {
        description: 'Location model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Location)) where?: Where<Location>,
  ): Promise<Count> {
    return this.locationRepository.count(where);
  }

  @get('/locations', {
    responses: {
      '200': {
        description: 'Array of Location model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Location, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Location)) filter?: Filter<Location>,
  ): Promise<Location[]> {
    return this.locationRepository.find(filter);
  }

  @get('/locations/{id}', {
    responses: {
      '200': {
        description: 'Location model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Location, { includeRelations: true }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.query.object('filter', getFilterSchemaFor(Location)) filter?: Filter<Location>
  ): Promise<Location> {
    return this.locationRepository.findById(id, filter);
  }

  @patch('/locations', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Location PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Location, { partial: true }),
        },
      },
    })
    location: Location,
    @param.query.object('where', getWhereSchemaFor(Location))
    where?: Where<Location>,
  ): Promise<Count> {
    return this.locationService.updateAll(location, where);
  }

  @patch('/locations/{id}', {
    responses: {
      '204': {
        description: 'Location patch success'
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Location, { partial: true }),
        },
      },
    })
    location: Location,
  ): Promise<void> {
    await this.locationService.updateById(id, location);
  }

  @del('/locations/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Location DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.locationService.deleteById(id);
  }
}
