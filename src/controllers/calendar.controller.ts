import {
  Filter,
  repository,
  CountSchema,
  Where,
  Count,
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
import { Calendar } from '../models';
import { CalendarRepository } from '../repositories';
import { service } from '@loopback/core';
import { authenticate } from '@loopback/authentication';
import { CalendarService } from '../services';

@authenticate('jwt')
export class CalendarController {
  constructor(
    @repository(CalendarRepository)
    public calendarRepository: CalendarRepository,
    @service(CalendarService)
    public calendarService: CalendarService
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
    return this.calendarService.create(calendar);
  }

  @post('/calendars/bulk', {
    responses: {
      '200': {
        description: 'Calendars model instance',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': {
                type: 'array',
                items: {
                  type: 'array',
                  items: {
                    'x-ts-type': Calendar,
                  },
                },
              }
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
            'x-ts-type': {
              type: 'array',
              items: {
                type: 'array',
                items: {
                  'x-ts-type': Calendar,
                },
              },
            },
            title: "New Calendar List Create"
          }
        }
      }
    })
    calendars: Calendar[],
  ): Promise<Calendar[]> {
    return this.calendarService.createBulk(calendars);
  }

  @get('/calendars/count', {
    responses: {
      '200': {
        description: 'Calendar model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Calendar)) where?: Where<Calendar>,
  ): Promise<Count> {
    return this.calendarRepository.count(where);
  }

  @get('/calendars', {
    responses: {
      '200': {
        description: 'Array of Calendar model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Calendar, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Calendar)) filter?: Filter<Calendar>,
  ): Promise<Calendar[]> {
    return this
      .calendarRepository
      .find(filter);
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
    await this.calendarService.updateById(id, calendar);
  }

  @del('/calendars/{id}', {
    responses: {
      '204': {
        description: 'Calendar DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.calendarService.deleteById(id);
  }
}
