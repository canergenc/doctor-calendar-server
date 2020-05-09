import { bind, /* inject, */ BindingScope } from '@loopback/core';
import { ErrorLogRepository } from '../repositories';
import { repository } from '@loopback/repository';

@bind({ scope: BindingScope.TRANSIENT })
export class ErrorLogService {
  constructor(
    @repository(ErrorLogRepository) private errorLogRepository: ErrorLogRepository,
  ) { }

  async deleteById(id: string): Promise<void> {
    await this.errorLogRepository.updateAll({ isDeleted: true }, { id: id })
  }
}
