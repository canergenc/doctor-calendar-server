import { Entity, model, property } from '@loopback/repository';

@model({ settings: { strict: false } })
export class Role extends Entity {
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
    type: 'date',
    default: () => new Date(),
  })
  createdAt?: Date;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  updateAt?: Date;

  constructor(data?: Partial<Role>) {
    super(data);
  }
}

