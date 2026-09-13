import { Injectable } from '@nestjs/common';
import { LibraryClientService } from '../library/library-client.service';
import { StructuredLogger } from '../logger/logger.service';

@Injectable()
export class A2AService {
  private readonly logger = new StructuredLogger('transaction-agent');

  constructor(private readonly client: LibraryClientService) {}

  private readonly skills: Record<string, (params: any) => Promise<any>> = {
    create_rental: (params) =>
      this.client.executeTool('create_rental', {
        bookId: Number(params.bookId),
        durationDays: Number(params.durationDays) || 14,
        authToken: params.authToken,
      }),
    purchase_book: (params) =>
      this.client.executeTool('purchase_book', {
        bookId: Number(params.bookId),
        authToken: params.authToken,
      }),
    return_book: (params) =>
      this.client.executeTool('return_book', {
        rentalId: Number(params.rentalId),
        authToken: params.authToken,
      }),
    get_my_library: (params) =>
      this.client.executeTool('get_my_library', { authToken: params.authToken }),
  };

  listSkills(): string[] {
    return Object.keys(this.skills);
  }

  async handleSkill(skill: string, params: any, correlationId?: string): Promise<any> {
    const handler = this.skills[skill];
    if (!handler) {
      throw new Error(
        `Unknown skill '${skill}' for transaction-agent. Available: ${this.listSkills().join(', ')}`,
      );
    }
    const result = await handler(params);
    const sanitized = { ...params };
    if (sanitized.authToken) sanitized.authToken = '***';
    this.logger.log('A2A skill executed', correlationId, {
      payload: { agent: 'transaction-agent', skill, params: sanitized, result },
    });
    return result;
  }
}
