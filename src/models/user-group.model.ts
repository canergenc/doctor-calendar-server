import { Entity, model, property, belongsTo} from '@loopback/repository';
import {Group} from './group.model';
import {User} from './user.model';

@model()
export class UserGroup extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id: string;
  @belongsTo(() => Group)
  groupId: string;

  @belongsTo(() => User)
  userId: string;

  constructor(data?: Partial<UserGroup>) {
    super(data);
  }
}

export interface UserGroupRelations {
  // describe navigational properties here
}

export type UserGroupWithRelations = UserGroup & UserGroupRelations;
