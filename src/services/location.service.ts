import { bind, /* inject, */ BindingScope, inject } from '@loopback/core';
import { Location } from '../models';
import { LocationRepository } from '../repositories';
import { SecurityBindings, UserProfile, securityId } from '@loopback/security';
import { repository } from '@loopback/repository';

@bind({ scope: BindingScope.TRANSIENT })
export class LocationService {
  constructor(
    @repository(LocationRepository) public locationRepository: LocationRepository,
    @inject(SecurityBindings.USER) public currentUserProfile: UserProfile
  ) { }

  async create(location: Location): Promise<Location> {
    location.createdUserId = location.updatedUserId = this.currentUserProfile[securityId];
    delete this.currentUserProfile[securityId];
    return this.locationRepository.create(location);
  }

  async updateById(id: string, location: Location): Promise<void> {
    location.updatedDate = new Date();
    location.updatedUserId = this.currentUserProfile[securityId];
    delete this.currentUserProfile[securityId];
    await this.locationRepository.updateById(id, location);
  }
}
