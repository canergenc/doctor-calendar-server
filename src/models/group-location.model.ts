import {Entity, model, property} from '@loopback/repository';

@model()
export class GroupLocation extends Entity {
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
  name: string;

  @property({
    type: 'string',
  })
  groupId?: string;

  @property({
    type: 'string',
  })
  locationId?: string;


  constructor(data?: Partial<GroupLocation>) {
    super(data);
  }
}

export interface GroupLocationRelations {
  // describe navigational properties here
}

export type GroupLocationWithRelations = GroupLocation & GroupLocationRelations;
