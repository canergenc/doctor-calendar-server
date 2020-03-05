import { DefaultCrudRepository, juggler, repository, BelongsToAccessor } from '@loopback/repository';
import { Location, Group } from '../models';
import { inject, Getter } from '@loopback/core';
import { DataSourceName } from '../keys';
import { GroupRepository } from './group.repository';

export class LocationRepository extends DefaultCrudRepository<
  Location,
  typeof Location.prototype.id
  > {

  public readonly group: BelongsToAccessor<Group, typeof Location.prototype.id>;

  constructor(
    @inject(DataSourceName.DATA_SOURCE_NAME) dataSource: juggler.DataSource, @repository.getter('GroupRepository') protected groupRepositoryGetter: Getter<GroupRepository>,
  ) {
    super(Location, dataSource);
    this.group = this.createBelongsToAccessorFor('group', groupRepositoryGetter);
    this.registerInclusionResolver('group', this.group.inclusionResolver);
  }
}
