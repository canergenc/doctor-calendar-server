import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Calendar,
  Location,
} from '../models';
import {CalendarRepository} from '../repositories';

export class CalendarLocationController {
  constructor(
    @repository(CalendarRepository)
    public calendarRepository: CalendarRepository,
  ) { }

  @get('/calendars/{id}/location', {
    responses: {
      '200': {
        description: 'Location belonging to Calendar',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Location)},
          },
        },
      },
    },
  })
  async getLocation(
    @param.path.string('id') id: typeof Calendar.prototype.id,
  ): Promise<Location> {
    return this.calendarRepository.location(id);
  }
}
