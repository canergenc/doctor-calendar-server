import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Location,
  Group,
} from '../models';
import {LocationRepository} from '../repositories';

export class LocationGroupController {
  constructor(
    @repository(LocationRepository)
    public locationRepository: LocationRepository,
  ) { }

  @get('/locations/{id}/group', {
    responses: {
      '200': {
        description: 'Group belonging to Location',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Group)},
          },
        },
      },
    },
  })
  async getGroup(
    @param.path.string('id') id: typeof Location.prototype.id,
  ): Promise<Group> {
    return this.locationRepository.group(id);
  }
}
