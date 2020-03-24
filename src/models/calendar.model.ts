import { Entity, model, property, belongsTo } from "@loopback/repository";
import { CalendarType } from "../enums/calendarType.enum";
import { User } from './user.model';
import { Group } from './group.model';
import { Location } from './location.model';

@model()
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
  })
  type?: number;

  @belongsTo(() => User)
  userId: string;

  @belongsTo(() => Group)
  groupId: string;

  @belongsTo(() => Location)
  locationId: string;

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
    type: 'boolean',
    default: () => false,
  })
  isDeleted?: boolean;

  constructor(data?: Partial<Calendar>) {
    super(data);
  }
}
