import { bind, /* inject, */ BindingScope, inject, service } from '@loopback/core';
import { Location } from '../models';
import { LocationRepository, CalendarRepository } from '../repositories';
import { SecurityBindings, UserProfile, securityId } from '@loopback/security';
import { repository, Where, Count } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';

@bind({ scope: BindingScope.TRANSIENT })
export class LocationService {
  constructor(
    @repository(LocationRepository) private locationRepository: LocationRepository,
    @repository(CalendarRepository) private calendarRepository: CalendarRepository,
    @inject(SecurityBindings.USER) private currentUserProfile: UserProfile
  ) { }

  async create(location: Location): Promise<Location> {
    location.createdUserId = location.updatedUserId = this.currentUserProfile[securityId];
    delete this.currentUserProfile[securityId];
    return await this.locationRepository.create(location);
  }

  async createBulk(locations: Location[]): Promise<Location[]> {
    try {
      for (const location of locations) {
        location.createdUserId = location.updatedUserId = this.currentUserProfile[securityId];
      }
      return await this.locationRepository.createAll(locations);
    } catch (error) {
      throw new HttpErrors.BadRequest(error.message);
    }
  }

  /** Sort Order mantığı için zorunlu yapıldı. Daha iyi bir yöntemde kaldırılabilir. */
  async updateBulk(locations: Location[]): Promise<void> {
    for (const location of locations) {
      await this.updateById(location.id, location);
    }
  }

  async updateById(id: string, location: Location): Promise<void> {
    location.updatedDate = new Date();
    location.updatedUserId = this.currentUserProfile[securityId];
    await this.locationRepository.updateById(id, location).catch(err => {
      throw new HttpErrors.BadRequest(err);
    });
  }

  async updateAll(location: Location, where?: Where<Location>): Promise<Count> {
    location.updatedDate = new Date();
    location.updatedUserId = this.currentUserProfile[securityId];
    return this.locationRepository.updateAll(location, where);
  }

  async deleteById(id: string): Promise<void> {
    await this.locationRepository.updateAll({
      isActive: false,
      updatedDate: new Date(),
      updatedUserId: this.currentUserProfile[securityId]
    }, { id: id }).then(async () => {

      /**Calendar Delete Daha sonra düşünülecek*/
      // await this.calendarRepository.updateAll({
      //   isDeleted: true,
      //   updatedDate: new Date(),
      //   updatedUserId: this.currentUserProfile[securityId]
      // }, { locationId: { like: id } });

    }).catch(ex => {
      throw new HttpErrors.NotFound(ex);
    });
  }
}
