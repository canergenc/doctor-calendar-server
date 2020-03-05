import { Entity, model, property, belongsTo } from '@loopback/repository';
import { Group } from './group.model';

@model()
export class Location extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
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
  colorCode: string;

  @belongsTo(() => Group)
  groupId: string;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  createdDate?: Date;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  updatedDate?: Date;

  constructor(data?: Partial<Location>) {
    super(data);
  }
}
