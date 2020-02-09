import { Entity, model, property } from "@loopback/repository";
import { CalendarType } from "../enums/calendarType.enum";

@model({ settings: { strict: false } })
export class Calendar extends Entity {
  @property({
    type: "number",
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: "string",
    required: true,
  })
  locationId: string;

  @property({
    type: "string",
    required: true,
  })
  userId: string;

  @property({
    type: "date",
    required: true,
  })
  date: string;

  @property({
    type: "string",
  })
  description?: string;

  @property({
    type: "object",
  })
  type?: CalendarType;

  constructor(data?: Partial<Calendar>) {
    super(data);
  }
}

export interface CalendarRelations {
  // describe navigational properties here
}

export type CalendarWithRelations = Calendar & CalendarRelations;
