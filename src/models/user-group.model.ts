import { Entity, model, property, belongsTo } from '@loopback/repository';
import { Group } from './group.model';
import { User } from './user.model';

@model({
  settings: {
    hiddenProperties: ['isDeleted'],
    scope: {
      where: { or: [{ isDeleted: false }] }
    }
  }
})
export class UserGroup extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id: string;
  @belongsTo(() => Group)
  groupId: string;

  @belongsTo(() => User)
  userId: string;

  @property({
    type: 'number',
  })
  weekdayCountLimit?: number;

  @property({
    type: 'number',
  })
  weekendCountLimit?: number;

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

  constructor(data?: Partial<UserGroup>) {
    super(data);
  }
}
