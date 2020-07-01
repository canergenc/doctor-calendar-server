import { Entity, model, property, Model } from '@loopback/repository';

@model({
  settings: {
    hiddenProperties: ['isDeleted'],
    scope: {
      where: { or: [{ isDeleted: false }] }
    }
  }
})
export class UserCredentials extends Entity {
  @property({
    type: 'string',
    id: true
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  @property({
    type: 'string',
    required: true
  })
  userId: string;

  @property({
    type: 'boolean'
  })
  emailVerified: boolean;

  @property({
    type: 'string',
  })
  forgotCode: string;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  createdDate: Date;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  updatedDate: Date;

  @property({
    type: 'string',
  })
  createdUserId: string;

  @property({
    type: 'string',
  })
  updatedUserId: string;

  @property({
    type: 'boolean',
    default: () => false,
  })
  isDeleted: boolean;


  constructor(data?: Partial<UserCredentials>) {
    super(data);
  }
}

@model()
export class ResetPassword extends Model {
  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      format: 'email',
      minLength: 5,
      maxLength: 50,
      transform: ['toLowerCase'],
      errorMessage:
        'Email alanı format dışı!',
    },
  })
  email: string;

  @property({
    type: 'string',
    required: true
  })
  code: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      maxLength: 16,
      minLength: 8,
      errorMessage:
        'parola minimum 8 karakter uzunluğunda olmalı!',
    },
  })
  password: string;
}

export interface UserCredentialsRelations {
  // describe navigational properties here
}

export type UserCredentialsWithRelations = UserCredentials & UserCredentialsRelations;
