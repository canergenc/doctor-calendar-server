import { DefaultCrudRepository, juggler, repository, BelongsToAccessor} from '@loopback/repository';
import { Calendar, CalendarRelations, User, Group, Location} from '../models';
import { inject, Getter} from '@loopback/core';
import { DataSourceName } from '../keys';
import {UserRepository} from './user.repository';
import {GroupRepository} from './group.repository';
import {LocationRepository} from './location.repository';

export class CalendarRepository extends DefaultCrudRepository<
  Calendar,
  typeof Calendar.prototype.id,
  CalendarRelations
  > {

  public readonly user: BelongsToAccessor<User, typeof Calendar.prototype.id>;

  public readonly group: BelongsToAccessor<Group, typeof Calendar.prototype.id>;

  public readonly location: BelongsToAccessor<Location, typeof Calendar.prototype.id>;

  constructor(
    @inject(DataSourceName.Data_Source_Name) dataSource: juggler.DataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>, @repository.getter('GroupRepository') protected groupRepositoryGetter: Getter<GroupRepository>, @repository.getter('LocationRepository') protected locationRepositoryGetter: Getter<LocationRepository>,
  ) {
    super(Calendar, dataSource);
    this.location = this.createBelongsToAccessorFor('location', locationRepositoryGetter,);
    this.registerInclusionResolver('location', this.location.inclusionResolver);
    this.group = this.createBelongsToAccessorFor('group', groupRepositoryGetter,);
    this.registerInclusionResolver('group', this.group.inclusionResolver);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);

  }
}
