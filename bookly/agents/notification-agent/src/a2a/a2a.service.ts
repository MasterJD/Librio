import { Injectable } from '@nestjs/common';
import { LibraryClientService } from '../library/library-client.service';
import { StructuredLogger } from '../logger/logger.service';

@Injectable()
export class A2AService {
  private readonly logger = new StructuredLogger('notification-agent');

  constructor(private readonly client: LibraryClientService) {}

  private readonly skills: Record<string, (params: any) => Promise<any>> = {
    send_notification: (params) =>
      this.client.executeTool('send_notification', {
        userId: Number(params.userId),
        type: params.type,
        subject: params.subject,
        message: params.message,
      }),
    get_notification_history: (params) =>
      this.client.executeTool('get_notification_history', {
        userId: Number(params.userId),
      }),
  };

  listSkills(): string[] {
    return Object.keys(this.skills);
  }

  async handleSkill(skill: string, params: any, correlationId?: string): Promise<any> {
    const handler = this.skills[skill];
    if (!handler) {
      throw new Error(
        `Unknown skill '${skill}' for notification-agent. Available: ${this.listSkills().join(', ')}`,
      );
    }
    const result = await handler(params);
    const sanitized = { ...params };
    if (sanitized.authToken) sanitized.authToken = '***';
    this.logger.log('A2A skill executed', correlationId, {
      payload: { agent: 'notification-agent', skill, params: sanitized, result },
    });
    return result;
  }
}
