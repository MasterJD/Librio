import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { randomUUID } from 'crypto';
import { StructuredLogger } from '../logger/logger.service';

export interface A2ATaskResult {
  taskId: string;
  status: string;
  artifacts?: { parts: { text: string }[] }[];
  error?: string;
}

@Injectable()
export class A2AClientService {
  private readonly logger = new StructuredLogger('orchestrator-agent');

  async sendTask(
    agentUrl: string,
    skill: string,
    params: Record<string, any>,
    correlationId?: string,
  ): Promise<A2ATaskResult> {
    const taskId = `task-${randomUUID().slice(0, 8)}`;
    const payload = {
      jsonrpc: '2.0',
      id: taskId,
      method: 'tasks/send',
      params: {
        taskId,
        message: {
          role: 'user',
          parts: [{ text: `${skill}|${JSON.stringify(params)}` }],
        },
      },
    };

    const response = await axios.post(`${agentUrl}/a2a/tasks/send`, payload, {
      headers: { 'x-correlation-id': correlationId || randomUUID() },
      timeout: 15000,
    });

    const sanitized = { ...params };
    if (sanitized.authToken) sanitized.authToken = '***';

    this.logger.log('A2A task delegated', correlationId, {
      payload: {
        to: agentUrl,
        skill,
        params: sanitized,
        response: response.data?.result || response.data?.error,
      },
    });

    if (response.data?.error) {
      return { taskId, status: 'failed', error: response.data.error.message };
    }
    return response.data?.result || { taskId, status: 'failed', error: 'No result' };
  }

  extractText(result: A2ATaskResult | undefined): any {
    if (!result) return null;
    if (result.error) return { error: result.error };
    const text = result.artifacts?.[0]?.parts?.[0]?.text;
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
}