import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  UserSetting,
  User,
} from '../models';
import {UserSettingRepository} from '../repositories';

export class UserSettingUserController {
  constructor(
    @repository(UserSettingRepository)
    public userSettingRepository: UserSettingRepository,
  ) { }

  @get('/user-settings/{id}/user', {
    responses: {
      '200': {
        description: 'User belonging to UserSetting',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(User)},
          },
        },
      },
    },
  })
  async getUser(
    @param.path.string('id') id: typeof UserSetting.prototype.id,
  ): Promise<User> {
    return this.userSettingRepository.user(id);
  }
}
