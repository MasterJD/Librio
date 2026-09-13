import { Injectable } from '@nestjs/common';
import { LibraryClientService } from '../library/library-client.service';
import { StructuredLogger } from '../logger/logger.service';

@Injectable()
export class A2AService {
  private readonly logger = new StructuredLogger('catalog-agent');

  constructor(private readonly client: LibraryClientService) {}

  private readonly skills: Record<string, (params: any) => Promise<any>> = {
    search_books: (params) =>
      this.client.executeTool('search_books', {
        query: params.query,
        genre: params.genre,
      }),
    get_book: (params) => this.client.executeTool('get_book', { bookId: Number(params.bookId) }),
  };

  listSkills(): string[] {
    return Object.keys(this.skills);
  }

  async handleSkill(skill: string, params: any, correlationId?: string): Promise<any> {
    const handler = this.skills[skill];
    if (!handler) {
      throw new Error(`Unknown skill '${skill}' for catalog-agent. Available: ${this.listSkills().join(', ')}`);
    }
    const result = await handler(params);
    const sanitized = { ...params };
    if (sanitized.authToken) sanitized.authToken = '***';
    this.logger.log('A2A skill executed', correlationId, {
      payload: { agent: 'catalog-agent', skill, params: sanitized, result },
    });
    return result;
  }
}
