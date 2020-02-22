import { Entity, model, property } from '@loopback/repository';

@model()
export class Group extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
    required: true
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
  })
  locationId: string;

  @property({
    type: 'string',
  })
  parentId: string;


  constructor(data?: Partial<Group>) {
    super(data);
  }
}

export interface GroupRelations {
  // describe navigational properties here
}

export type GroupWithRelations = Group & GroupRelations;
