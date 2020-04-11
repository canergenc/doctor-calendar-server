import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
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
import { ErrorLog } from '../models';
import { ErrorLogRepository } from '../repositories';
import { service } from '@loopback/boot/node_modules/@loopback/core';
import { ErrorLogService } from '../services';
import { authenticate } from '@loopback/authentication';
import { OPERATION_SECURITY_SPEC } from '../utils/security-spec';

@authenticate('jwt')
export class ErrorLogController {
  constructor(
    @repository(ErrorLogRepository)
    public errorLogRepository: ErrorLogRepository,
    @service(ErrorLogService) private errorLogService: ErrorLogRepository
  ) { }

  @post('/error-logs', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'ErrorLog model instance',
        content: { 'application/json': { schema: getModelSchemaRef(ErrorLog) } },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ErrorLog, {
            title: 'NewErrorLog',

          }),
        },
      },
    })
    errorLog: ErrorLog,
  ): Promise<ErrorLog> {
    return this.errorLogRepository.create(errorLog);
  }

  @get('/error-logs/count', {
    responses: {
      '200': {
        description: 'ErrorLog model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(
    @param.where(ErrorLog) where?: Where<ErrorLog>,
  ): Promise<Count> {
    return this.errorLogRepository.count(where);
  }

  @get('/error-logs', {
    responses: {
      '200': {
        description: 'Array of ErrorLog model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(ErrorLog, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(ErrorLog) filter?: Filter<ErrorLog>,
  ): Promise<ErrorLog[]> {
    return this.errorLogRepository.find(filter);
  }

  @patch('/error-logs', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'ErrorLog PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ErrorLog, { partial: true }),
        },
      },
    })
    errorLog: ErrorLog,
    @param.where(ErrorLog) where?: Where<ErrorLog>,
  ): Promise<Count> {
    return this.errorLogRepository.updateAll(errorLog, where);
  }

  @get('/error-logs/{id}', {
    responses: {
      '200': {
        description: 'ErrorLog model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(ErrorLog, { includeRelations: true }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(ErrorLog, { exclude: 'where' }) filter?: FilterExcludingWhere<ErrorLog>
  ): Promise<ErrorLog> {
    return this.errorLogRepository.findById(id, filter);
  }

  @patch('/error-logs/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'ErrorLog PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ErrorLog, { partial: true }),
        },
      },
    })
    errorLog: ErrorLog,
  ): Promise<void> {
    await this.errorLogRepository.updateById(id, errorLog);
  }

  @del('/error-logs/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'ErrorLog DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.errorLogService.deleteById(id);
  }
}
