import { Entity, model, property, belongsTo } from "@loopback/repository";
import { User } from './user.model';
import { Group } from './group.model';
import { Location } from './location.model';

@model({
  settings: {
    hiddenProperties: ['isDeleted'],
    scope: {
      where: { or: [{ isDeleted: false }] }
    }
  }
})
export class Calendar extends Entity {
  @property({
    type: "string",
    id: true,
    generated: true,
  })
  id: string;

  @property({
    type: "string",
  })
  description: string;

  @property({
    type: 'string',
  })
  note: string;

  @property({
    type: "number",
    required: true
  })
  type?: number;

  @belongsTo(() => User)
  userId: string;

  @belongsTo(() => Group)
  groupId: string;

  @belongsTo(() => Location)
  locationId: string;

  @property({
    type: "boolean",
    required: true
  })
  isWeekend?: boolean;

  @property({
    type: 'date',
    required: true
  })
  startDate: Date;

  @property({
    type: 'date',
    required: true
  })
  endDate: Date;

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
  isDraft?: boolean;

  @property({
    type: "number"
  })
  status?: number;

  @property({
    type: 'boolean',
    default: () => false,
  })
  isDeleted: boolean;

  constructor(data?: Partial<Calendar>) {
    super(data);
  }
}
