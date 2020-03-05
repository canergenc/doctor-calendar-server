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
import { Location } from '../models';
import { LocationRepository } from '../repositories';

export class LocationController {
  constructor(
    @repository(LocationRepository)
    public locationRepository: LocationRepository,
  ) { }

  @post('/locations', {
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
    return this.locationRepository.create(location);
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

  @post('/locations/{id}', {
    responses: {
      '200': {
        description: 'Location update success'
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Location),
        },
      },
    })
    location: Location,
  ): Promise<void> {
    location.updatedDate = new Date();
    await this.locationRepository.updateById(id, location);
  }

  @del('/locations/{id}', {
    responses: {
      '204': {
        description: 'Location DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.locationRepository.deleteById(id);
  }
}
