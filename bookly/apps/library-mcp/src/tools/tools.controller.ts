import { Controller, Get, Post, Body, Param, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { ToolsService } from './tools.service';
import { StructuredLogger } from '../logger/logger.service';

@Controller('mcp')
export class ToolsController {
  private readonly logger = new StructuredLogger(ToolsController.name);

  constructor(private readonly toolsService: ToolsService) {}

  @Get('tools')
  listTools() {
    const tools = this.toolsService.listTools();
    this.logger.log('Listing MCP tools', undefined, {
      payload: { count: tools.length, names: tools.map((t) => t.name) },
    });
    return tools;
  }

  @Post('tools/:name/execute')
  @HttpCode(HttpStatus.OK)
  async executeTool(
    @Param('name') name: string,
    @Body() body: { params?: Record<string, any> },
    @Headers('x-correlation-id') correlationId?: string,
  ) {
    const result = await this.toolsService.executeTool(name, body.params || {});
    const sanitized = { ...(body.params || {}) };
    if (sanitized.authToken) sanitized.authToken = '***';
    this.logger.log('MCP tool executed', correlationId, {
      payload: { tool: name, params: sanitized, result },
    });
    return result;
  }

  @Get('capabilities')
  getCapabilities() {
    const capabilities = {
      name: 'bookly-mcp-server',
      version: '1.0.0',
      description: 'Bookly Digital Library MCP Server - provides tools for AI agents to interact with the library',
      tools: this.toolsService.listTools().map((t) => t.name),
    };
    this.logger.log('Capabilities requested', undefined, {
      payload: { name: capabilities.name, version: capabilities.version },
    });
    return capabilities;
  }
}