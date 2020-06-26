import { Entity, model, property } from '@loopback/repository';

@model({
  settings: {
    hiddenProperties: ['isDeleted'],
    scope: {
      where: { or: [{ isDeleted: false }] }
    }
  }
})
export class ErrorLog extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'string',
  })
  code?: string;

  @property({
    type: 'number',
  })
  type?: number;

  @property({
    type: 'string',
  })
  url?: string;

  @property({
    type: 'string',
  })
  methodName?: string;

  @property({
    type: 'object',
  })
  methodInput?: object;

  @property({
    type: 'string',
  })
  errorStack?: string;

  @property({
    type: 'string',
  })
  description?: string;

  @property({
    type: 'string',
  })
  createdUserId?: string;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  createdDate?: string;

  @property({
    type: 'boolean',
    default: false,
  })
  isDeleted?: boolean;


  constructor(data?: Partial<ErrorLog>) {
    super(data);
  }
}

export interface ErrorLogRelations {
  // describe navigational properties here
}

export type ErrorLogWithRelations = ErrorLog & ErrorLogRelations;
