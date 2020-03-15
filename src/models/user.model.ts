import { Entity, model, property, hasOne } from '@loopback/repository';
import { UserCredentials } from './user-credentials.model';
import { Group } from './group.model';
import { Role } from './role.model';

@model({
  settings: {
    indexes: {
      uniqueEmail: {
        keys: {
          email: 1,
        },
        options: {
          unique: true,
        },
      },
    },
  }
})
export class User extends Entity {
  @property({
    type: 'string',
    id: true
  })
  id: string;

  @property({
    type: 'string',
    format: 'email',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  fullName: string;

  @property({
    type: 'string'
  })
  title: string;

  @property({
    type: 'string',
  })
  deviceId?: string;

  @hasOne(() => UserCredentials)
  userCredentials: UserCredentials;

  @property({
    type: 'array',
    itemType: 'string',
  })
  roles?: string[];

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
  updatedUserId?: string;


  constructor(data?: Partial<User>) {
    super(data);
  }
}

@model()
export class UserInfoOutputModel {
  @property({
    type: 'object',
  })
  user: User;

  @property({
    type: 'array',
    itemType: Group,
  })
  groups: Group[];

  /*Geçici Model */
  @property({
    type: 'array',
    itemType: 'string',
  })
  roles?: string[];

  /*Orjinal Model */
  /*
    @property({
      type: 'array',
    })
    roles: Role[];*/
}
