import {DefaultCrudRepository} from '@loopback/repository';
import {MailTemplate, MailTemplateRelations} from '../models';
import {MongoDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class MailTemplateRepository extends DefaultCrudRepository<
  MailTemplate,
  typeof MailTemplate.prototype.id,
  MailTemplateRelations
> {
  constructor(
    @inject('datasources.mongo') dataSource: MongoDataSource,
  ) {
    super(MailTemplate, dataSource);
  }
}
