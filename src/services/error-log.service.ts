import { bind, /* inject, */ BindingScope } from '@loopback/core';
import { repository } from '@loopback/boot/node_modules/@loopback/repository';
import { ErrorLogRepository } from '../repositories';

@bind({ scope: BindingScope.TRANSIENT })
export class ErrorLogService {
  constructor(
    @repository(ErrorLogRepository) private errorLogRepository: ErrorLogRepository,
  ) { }

  async deleteById(id: string): Promise<void> {
    await this.errorLogRepository.updateAll({ isDeleted: true }, { id: id })
  }
}
