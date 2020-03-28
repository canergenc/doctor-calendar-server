import { Entity, model, property, belongsTo } from "@loopback/repository";
import { CalendarType } from "../enums/calendarType.enum";
import { User } from './user.model';
import { Group } from './group.model';
import { Location } from './location.model';

@model({
  settings: {
    hiddenProperties: ['isDeleted'],
    scope: {
      where: { or: [{ isDeleted: false }, { isDeleted: undefined }] }
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
    type: "date",
    required: true,
  })
  date: Date;

  @property({
    type: "string",
  })
  description: string;

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
    type: "string",
  })
  calendarGroupId?: string;

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
  isDeleted?: boolean;

  constructor(data?: Partial<Calendar>) {
    super(data);
  }
}
