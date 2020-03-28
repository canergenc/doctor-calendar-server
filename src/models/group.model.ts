import { Entity, model, property } from '@loopback/repository';

@model({
  settings: {
    hiddenProperties: ['isDeleted'],
    scope: {
      where: { or: [{ isDeleted: false }, { isDeleted: undefined }] }
    }
  }
})
export class Group extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true
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
  canerTest: string;

  @property({
    type: 'string',
  })
  parentId?: string;

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

  @property({
    type: 'string',
  })
  createdUserId?: string;

  @property({
    type: 'string',
  })
  updatedUserId?: string;

  @property({
    type: 'boolean',
    default: () => false,
  })
  isDeleted?: boolean;

  constructor(data?: Partial<Group>) {
    super(data);
  }
}
