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
            exclude: ['y'],
          }),
        },
      },
    })
    calendar: Omit<Calendar, 'y'>,
  ): Promise<Calendar> {
    return this.calendarRepository.create(calendar);
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
    return this.calendarRepository.find(filter);
  }

  @patch('/calendars', {
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
    @param.query.object('where', getWhereSchemaFor(Calendar)) where?: Where<Calendar>,
  ): Promise<Count> {
    return this.calendarRepository.updateAll(calendar, where);
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
    @param.path.number('id') id: number,
    @param.query.object('filter', getFilterSchemaFor(Calendar)) filter?: Filter<Calendar>
  ): Promise<Calendar> {
    return this.calendarRepository.findById(id, filter);
  }

  @patch('/calendars/{id}', {
    responses: {
      '204': {
        description: 'Calendar PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Calendar, { partial: true }),
        },
      },
    })
    calendar: Calendar,
  ): Promise<void> {
    await this.calendarRepository.updateById(id, calendar);
  }

  @put('/calendars/{id}', {
    responses: {
      '204': {
        description: 'Calendar PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() calendar: Calendar,
  ): Promise<void> {
    await this.calendarRepository.replaceById(id, calendar);
  }

  @del('/calendars/{id}', {
    responses: {
      '204': {
        description: 'Calendar DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.calendarRepository.deleteById(id);
  }
}
