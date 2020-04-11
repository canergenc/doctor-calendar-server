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
import { UserSetting } from '../models';
import { UserSettingRepository } from '../repositories';
import { authenticate } from '@loopback/authentication';
import { OPERATION_SECURITY_SPEC } from '../utils/security-spec';
import { service } from '@loopback/boot/node_modules/@loopback/core';
import { UserSettingService } from '../services';

@authenticate('jwt')
export class UserSettingController {
  constructor(
    @repository(UserSettingRepository)
    public userSettingRepository: UserSettingRepository,
    @service(UserSettingService) private userSettingService: UserSettingService
  ) { }

  @post('/user-settings', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'UserSetting model instance',
        content: { 'application/json': { schema: getModelSchemaRef(UserSetting) } },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserSetting, {
            title: 'NewUserSetting',

          }),
        },
      },
    })
    userSetting: UserSetting,
  ): Promise<UserSetting> {
    return this.userSettingService.create(userSetting);
  }

  @get('/user-settings/count', {
    responses: {
      '200': {
        description: 'UserSetting model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(
    @param.where(UserSetting) where?: Where<UserSetting>,
  ): Promise<Count> {
    return this.userSettingRepository.count(where);
  }

  @get('/user-settings', {
    responses: {
      '200': {
        description: 'Array of UserSetting model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(UserSetting, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(UserSetting) filter?: Filter<UserSetting>,
  ): Promise<UserSetting[]> {
    return this.userSettingRepository.find(filter);
  }

  @patch('/user-settings', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'UserSetting PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserSetting, { partial: true }),
        },
      },
    })
    userSetting: UserSetting,
    @param.where(UserSetting) where?: Where<UserSetting>,
  ): Promise<Count> {
    return this.userSettingService.updateAll(userSetting, where);
  }

  @get('/user-settings/{id}', {
    responses: {
      '200': {
        description: 'UserSetting model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(UserSetting, { includeRelations: true }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(UserSetting, { exclude: 'where' }) filter?: FilterExcludingWhere<UserSetting>
  ): Promise<UserSetting> {
    return this.userSettingRepository.findById(id, filter);
  }

  @patch('/user-settings/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'UserSetting PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserSetting, { partial: true }),
        },
      },
    })
    userSetting: UserSetting,
  ): Promise<void> {
    await this.userSettingService.updateById(id, userSetting);
  }

  @del('/user-settings/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'UserSetting DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.userSettingService.deleteById(id);
  }
}
