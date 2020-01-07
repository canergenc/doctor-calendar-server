import { Entity, model, property } from '@loopback/repository';

@model()
export class UserLocation extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
    required: true,
  })
  userId: number;

  @property({
    type: 'number',
    required: true,
  })
  locationId: number;


  constructor(data?: Partial<UserLocation>) {
    super(data);
  }
}

export interface UserLocationRelations {
  // describe navigational properties here
}

export type UserLocationWithRelations = UserLocation & UserLocationRelations;
