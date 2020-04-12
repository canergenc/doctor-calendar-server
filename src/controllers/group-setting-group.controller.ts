import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  GroupSetting,
  Group,
} from '../models';
import {GroupSettingRepository} from '../repositories';

export class GroupSettingGroupController {
  constructor(
    @repository(GroupSettingRepository)
    public groupSettingRepository: GroupSettingRepository,
  ) { }

  @get('/group-settings/{id}/group', {
    responses: {
      '200': {
        description: 'Group belonging to GroupSetting',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Group)},
          },
        },
      },
    },
  })
  async getGroup(
    @param.path.string('id') id: typeof GroupSetting.prototype.id,
  ): Promise<Group> {
    return this.groupSettingRepository.group(id);
  }
}
