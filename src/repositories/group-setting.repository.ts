import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {GroupSetting, GroupSettingRelations, Group} from '../models';
import {MongoDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {GroupRepository} from './group.repository';

export class GroupSettingRepository extends DefaultCrudRepository<
  GroupSetting,
  typeof GroupSetting.prototype.id,
  GroupSettingRelations
> {

  public readonly group: BelongsToAccessor<Group, typeof GroupSetting.prototype.id>;

  constructor(
    @inject('datasources.mongo') dataSource: MongoDataSource, @repository.getter('GroupRepository') protected groupRepositoryGetter: Getter<GroupRepository>,
  ) {
    super(GroupSetting, dataSource);
    this.group = this.createBelongsToAccessorFor('group', groupRepositoryGetter,);
    this.registerInclusionResolver('group', this.group.inclusionResolver);
  }
}
