import {Entity, model, property} from '@loopback/repository';

@model()
export class MailTemplate extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'number',
  })
  mailType?: number;

  @property({
    type: 'string',
    required: true,
  })
  html: string;

  @property({
    type: 'string',
  })
  description?: string;


  constructor(data?: Partial<MailTemplate>) {
    super(data);
  }
}

export interface MailTemplateRelations {
  // describe navigational properties here
}

export type MailTemplateWithRelations = MailTemplate & MailTemplateRelations;
