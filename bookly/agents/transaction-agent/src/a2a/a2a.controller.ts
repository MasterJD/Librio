import { Controller, Post, Body, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { A2AService } from './a2a.service';
import { StructuredLogger } from '../logger/logger.service';

interface TaskPart {
  text?: string;
}

interface TaskMessage {
  role?: string;
  parts?: TaskPart[];
}

interface SendTaskBody {
  jsonrpc?: string;
  id?: string | number;
  method?: string;
  params?: {
    taskId?: string;
    message?: TaskMessage;
  };
}

@Controller('a2a')
export class A2AController {
  private readonly logger = new StructuredLogger('transaction-agent');

  constructor(private readonly a2aService: A2AService) {}

  @Post('tasks/send')
  @HttpCode(HttpStatus.OK)
  async sendTask(
    @Body() body: SendTaskBody,
    @Headers('x-correlation-id') correlationId?: string,
  ) {
    const taskId = body?.params?.taskId || `task-${Date.now()}`;
    const text = body?.params?.message?.parts?.[0]?.text || '';
    const [skill, paramsJson] = text.split('|');
    const params = paramsJson ? JSON.parse(paramsJson) : {};

    try {
      const result = await this.a2aService.handleSkill(skill.trim(), params, correlationId);
      return {
        jsonrpc: body?.jsonrpc || '2.0',
        id: body?.id ?? '1',
        result: {
          taskId,
          status: 'completed',
          artifacts: [{ parts: [{ text: JSON.stringify(result) }] }],
        },
      };
    } catch (error: any) {
      this.logger.error(
        `A2A task failed: ${skill} - ${error.message}`,
        undefined,
        correlationId,
      );
      return {
        jsonrpc: body?.jsonrpc || '2.0',
        id: body?.id ?? '1',
        error: {
          code: -32000,
          message: error.message,
        },
      };
    }
  }
}
