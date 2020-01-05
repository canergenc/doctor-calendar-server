import { Entity, model, property } from '@loopback/repository';

@model({ settings: { strict: false } })
export class Calendar extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id: number;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: false,
  })
  description: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Calendar>) {
    super(data);
  }
}

export interface CalendarRelations {
  // describe navigational properties here
}

export type CalendarWithRelations = Calendar & CalendarRelations;
