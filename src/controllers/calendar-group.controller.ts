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
  Group,
} from '../models';
import {CalendarRepository} from '../repositories';

export class CalendarGroupController {
  constructor(
    @repository(CalendarRepository)
    public calendarRepository: CalendarRepository,
  ) { }

  @get('/calendars/{id}/group', {
    responses: {
      '200': {
        description: 'Group belonging to Calendar',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Group)},
          },
        },
      },
    },
  })
  async getGroup(
    @param.path.string('id') id: typeof Calendar.prototype.id,
  ): Promise<Group> {
    return this.calendarRepository.group(id);
  }
}
