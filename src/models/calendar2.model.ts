import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class Calendar2 extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  name?: string;

  @property({
    type: 'string',
    required: true,
  })
  description: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Calendar2>) {
    super(data);
  }
}

export interface Calendar2Relations {
  // describe navigational properties here
}

export type Calendar2WithRelations = Calendar2 & Calendar2Relations;
