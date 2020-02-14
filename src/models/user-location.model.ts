import { Entity, model, property } from '@loopback/repository';

@model()
export class UserLocation extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  userId: string;

  @property({
    type: 'string',
    required: true,
  })
  locationId: string;


  constructor(data?: Partial<UserLocation>) {
    super(data);
  }
}

export interface UserLocationRelations {
  // describe navigational properties here
}

export type UserLocationWithRelations = UserLocation & UserLocationRelations;
