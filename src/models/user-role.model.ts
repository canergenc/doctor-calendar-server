import { Entity, model, property, belongsTo } from '@loopback/repository';
import { User } from './user.model';
import { Role } from './role.model';

@model()
export class UserRole extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id: string;

  @belongsTo(() => User)
  userId: string;

  @belongsTo(() => Role)
  roleId: string;

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

  constructor(data?: Partial<UserRole>) {
    super(data);
  }
}
