import { Entity, model, property } from '@loopback/repository';

@model({
  settings: {
    hiddenProperties: ['isDeleted'],
    scope: {
      where: { or: [{ isDeleted: false }, { isDeleted: undefined }] }
    },
    strict: false
  }
})
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
  createdDate: Date;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  updatedDate: Date;

  @property({
    type: 'string',
  })
  createdUserId: string;

  @property({
    type: 'string',
  })
  updatedUserId: string;

  @property({
    type: 'boolean',
    default: () => false,
  })
  isDeleted: boolean;

  constructor(data?: Partial<Role>) {
    super(data);
  }
}

