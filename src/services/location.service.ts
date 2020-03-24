import { bind, /* inject, */ BindingScope, inject } from '@loopback/core';
import { Location } from '../models';
import { LocationRepository } from '../repositories';
import { SecurityBindings, UserProfile, securityId } from '@loopback/security';
import { repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';

@bind({ scope: BindingScope.TRANSIENT })
export class LocationService {
  constructor(
    @repository(LocationRepository) public locationRepository: LocationRepository,
    @inject(SecurityBindings.USER) public currentUserProfile: UserProfile
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

  async updateById(id: string, location: Location): Promise<void> {
    location.updatedDate = new Date();
    location.updatedUserId = this.currentUserProfile[securityId];
    delete this.currentUserProfile[securityId];
    await this.locationRepository.updateById(id, location);
  }

  async deleteById(id: string): Promise<void> {
    await this.locationRepository.findOne({ where: { id: id } }).then(async result => {
      if (result) {
        result.isDeleted = true;
        await this.locationRepository.updateById(id, result);
      }
    })
  }
}
