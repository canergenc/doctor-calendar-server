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
import { GroupSetting } from '../models';
import { GroupSettingRepository } from '../repositories';
import { authenticate } from '@loopback/authentication';
import { OPERATION_SECURITY_SPEC } from '../utils/security-spec';
import { service } from '@loopback/boot/node_modules/@loopback/core';
import { GroupSettingService } from '../services';

@authenticate('jwt')
export class GroupSettingController {
  constructor(
    @repository(GroupSettingRepository)
    public groupSettingRepository: GroupSettingRepository,
    @service(GroupSettingService) private groupSettingService: GroupSettingService
  ) { }

  @post('/group-settings', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'GroupSetting model instance',
        content: { 'application/json': { schema: getModelSchemaRef(GroupSetting) } },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(GroupSetting, {
            title: 'NewGroupSetting',

          }),
        },
      },
    })
    groupSetting: GroupSetting,
  ): Promise<GroupSetting> {
    return this.groupSettingService.create(groupSetting);
  }

  @get('/group-settings/count', {
    responses: {
      '200': {
        description: 'GroupSetting model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(
    @param.where(GroupSetting) where?: Where<GroupSetting>,
  ): Promise<Count> {
    return this.groupSettingRepository.count(where);
  }

  @get('/group-settings', {
    responses: {
      '200': {
        description: 'Array of GroupSetting model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(GroupSetting, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(GroupSetting) filter?: Filter<GroupSetting>,
  ): Promise<GroupSetting[]> {
    return this.groupSettingRepository.find(filter);
  }

  @patch('/group-settings', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'GroupSetting PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(GroupSetting, { partial: true }),
        },
      },
    })
    groupSetting: GroupSetting,
    @param.where(GroupSetting) where?: Where<GroupSetting>,
  ): Promise<Count> {
    return this.groupSettingService.updateAll(groupSetting, where);
  }

  @get('/group-settings/{id}', {
    responses: {
      '200': {
        description: 'GroupSetting model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(GroupSetting, { includeRelations: true }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(GroupSetting, { exclude: 'where' }) filter?: FilterExcludingWhere<GroupSetting>
  ): Promise<GroupSetting> {
    return this.groupSettingRepository.findById(id, filter);
  }

  @patch('/group-settings/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'GroupSetting PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(GroupSetting, { partial: true }),
        },
      },
    })
    groupSetting: GroupSetting,
  ): Promise<void> {
    await this.groupSettingService.updateById(id, groupSetting);
  }

  @del('/group-settings/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'GroupSetting DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.groupSettingService.deleteById(id);
  }
}
