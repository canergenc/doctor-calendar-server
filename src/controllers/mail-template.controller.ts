import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
} from '@loopback/rest';
import {MailTemplate} from '../models';
import {MailTemplateRepository} from '../repositories';

export class MailTemplateController {
  constructor(
    @repository(MailTemplateRepository)
    public mailTemplateRepository : MailTemplateRepository,
  ) {}

  @post('/mail-templates', {
    responses: {
      '200': {
        description: 'MailTemplate model instance',
        content: {'application/json': {schema: getModelSchemaRef(MailTemplate)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(MailTemplate, {
            title: 'NewMailTemplate',
            
          }),
        },
      },
    })
    mailTemplate: MailTemplate,
  ): Promise<MailTemplate> {
    return this.mailTemplateRepository.create(mailTemplate);
  }

  @get('/mail-templates/count', {
    responses: {
      '200': {
        description: 'MailTemplate model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(MailTemplate) where?: Where<MailTemplate>,
  ): Promise<Count> {
    return this.mailTemplateRepository.count(where);
  }

  @get('/mail-templates', {
    responses: {
      '200': {
        description: 'Array of MailTemplate model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(MailTemplate, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(MailTemplate) filter?: Filter<MailTemplate>,
  ): Promise<MailTemplate[]> {
    return this.mailTemplateRepository.find(filter);
  }

  @patch('/mail-templates', {
    responses: {
      '200': {
        description: 'MailTemplate PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(MailTemplate, {partial: true}),
        },
      },
    })
    mailTemplate: MailTemplate,
    @param.where(MailTemplate) where?: Where<MailTemplate>,
  ): Promise<Count> {
    return this.mailTemplateRepository.updateAll(mailTemplate, where);
  }

  @get('/mail-templates/{id}', {
    responses: {
      '200': {
        description: 'MailTemplate model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(MailTemplate, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(MailTemplate, {exclude: 'where'}) filter?: FilterExcludingWhere<MailTemplate>
  ): Promise<MailTemplate> {
    return this.mailTemplateRepository.findById(id, filter);
  }

  @patch('/mail-templates/{id}', {
    responses: {
      '204': {
        description: 'MailTemplate PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(MailTemplate, {partial: true}),
        },
      },
    })
    mailTemplate: MailTemplate,
  ): Promise<void> {
    await this.mailTemplateRepository.updateById(id, mailTemplate);
  }

  @put('/mail-templates/{id}', {
    responses: {
      '204': {
        description: 'MailTemplate PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() mailTemplate: MailTemplate,
  ): Promise<void> {
    await this.mailTemplateRepository.replaceById(id, mailTemplate);
  }

  @del('/mail-templates/{id}', {
    responses: {
      '204': {
        description: 'MailTemplate DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.mailTemplateRepository.deleteById(id);
  }
}
