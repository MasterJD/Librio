import { Injectable } from '@nestjs/common';
import { allTools, Tool } from './index';
import { StructuredLogger } from '../logger/logger.service';

@Injectable()
export class ToolsService {
  private readonly logger = new StructuredLogger(ToolsService.name);
  private tools: Map<string, Tool>;

  constructor() {
    this.tools = new Map(allTools.map((tool) => [tool.name, tool]));
    this.logger.log('MCP Tools initialized', undefined, {
      toolCount: allTools.length,
      tools: allTools.map((t) => t.name),
    });
  }

  listTools() {
    return allTools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    }));
  }

  async executeTool(name: string, params: Record<string, any>) {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }

    this.logger.log('Executing MCP tool', undefined, { tool: name, params });
    const result = await tool.handler(params);
    this.logger.log('MCP tool executed', undefined, { tool: name, success: true });
    return result;
  }
}
