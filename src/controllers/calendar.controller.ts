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
import { Calendar } from '../models';
import { CalendarRepository } from '../repositories';

export class CalendarController {
  constructor(
    @repository(CalendarRepository)
    public calendarRepository: CalendarRepository,
  ) { }

  @post('/calendars', {
    responses: {
      '200': {
        description: 'Calendar model instance',
        content: { 'application/json': { schema: getModelSchemaRef(Calendar) } },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Calendar, {
            title: 'NewCalendar',

          }),
        },
      },
    })
    calendar: Calendar,
  ): Promise<Calendar> {
    return this.calendarRepository.create(calendar);
  }

  @get('/calendars', {
    responses: {
      '200': {
        description: 'Array of Calendar model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Calendar),
            },
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Calendar)) filter?: Filter<Calendar>,
  ): Promise<Calendar[]> {
    return this.calendarRepository.find(filter);
  }

  @get('/calendars/{id}', {
    responses: {
      '200': {
        description: 'Calendar model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Calendar, { includeRelations: true }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.query.object('filter', getFilterSchemaFor(Calendar)) filter?: Filter<Calendar>
  ): Promise<Calendar> {
    return this.calendarRepository.findById(id, filter);
  }

  @post('/calendars/{id}', {
    responses: {
      '200': {
        description: 'Calendar update success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Calendar),
        },
      },
    }) calendar: Calendar,
  ): Promise<void> {
    await this.calendarRepository.updateById(id, calendar);
  }

  @del('/calendars/{id}', {
    responses: {
      '204': {
        description: 'Calendar DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.calendarRepository.deleteById(id);
  }
}
