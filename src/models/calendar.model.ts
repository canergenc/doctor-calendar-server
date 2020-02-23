import { Entity, model, property, hasOne, belongsTo} from "@loopback/repository";
import { CalendarType } from "../enums/calendarType.enum";
import { User } from './user.model';
import {Group} from './group.model';
import {Location} from './location.model';

@model()
export class Calendar extends Entity {
  @property({
    type: "string",
    id: true,
    generated: true,
  })
  id?: string;
  @property({
    type: "date",
    required: true,
  })
  date: Date;

  @property({
    type: "string",
  })
  description?: string;

  @property({
    type: "object",
  })
  type?: CalendarType;

  @belongsTo(() => User)
  userId: string;

  @belongsTo(() => Group)
  groupId: string;

  @belongsTo(() => Location)
  locationId: string;

  constructor(data?: Partial<Calendar>) {
    super(data);
  }
}

export interface CalendarRelations {
  // describe navigational properties here
}

export type CalendarWithRelations = Calendar & CalendarRelations;
