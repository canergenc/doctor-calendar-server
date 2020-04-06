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
  patch,
} from '@loopback/rest';
import { Calendar } from '../models';
import { CalendarRepository } from '../repositories';
import { service } from '@loopback/core';
import { authenticate } from '@loopback/authentication';
import { CalendarService } from '../services';
import { OPERATION_SECURITY_SPEC } from '../utils/security-spec';

@authenticate('jwt')
export class CalendarController {
  constructor(
    @repository(CalendarRepository)
    public calendarRepository: CalendarRepository,
    @service(CalendarService)
    public calendarService: CalendarService
  ) { }

  @post('/calendars', {
    security: OPERATION_SECURITY_SPEC,
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
    security: OPERATION_SECURITY_SPEC,
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

  @patch('/calendars', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Calendar PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Calendar, { partial: true }),
        },
      },
    })
    calendar: Calendar,
    @param.query.object('where', getWhereSchemaFor(Calendar))
    where?: Where<Calendar>,
  ): Promise<Count> {
    return this.calendarService.updateAll(calendar, where);
  }

  @patch('/calendars/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Calendar patch success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Calendar, { partial: true }),
        },
      },
    }) calendar: Calendar,
  ): Promise<void> {
    await this.calendarService.updateById(id, calendar);
  }

  @del('/calendars/{id}', {
    security: OPERATION_SECURITY_SPEC,
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
