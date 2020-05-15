import { Entity, model, property, belongsTo } from '@loopback/repository';
import { Group } from './group.model';


@model({
  settings: {
    hiddenProperties: ['isDeleted'],
    scope: {
      where: { or: [{ isDeleted: false }] }
    }
  },
  indexes: {
    uniqueGroup: {
      keys: {
        groupId: 1,
      },
      options: {
        unique: true,
      },
    },
  },
})
export class GroupSetting extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true
  })
  id?: string;
  @property({
    type: 'boolean',
  })
  isWeekdayControl?: boolean;

  @property({
    type: 'boolean',
  })
  isWeekendControl?: boolean;

  @property({
    type: 'number',
  })
  sequentialOrderLimitCount?: number;

  @property({
    type: 'number',
  })
  locationDayLimitCount: number;

  @property({
    type: 'boolean',
  })
  locationDayLimit?: boolean;

  @property({
    type: 'date',
    default: new Date(),
  })
  createdDate?: Date;

  @property({
    type: 'date',
    default: new Date(),
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
    default: false
  })
  isDeleted?: boolean;

  @belongsTo(() => Group)
  groupId: string;

  constructor(data?: Partial<GroupSetting>) {
    super(data);
  }
}

export interface GroupSettingRelations {
  // describe navigational properties here
}

export type GroupSettingWithRelations = GroupSetting & GroupSettingRelations;
