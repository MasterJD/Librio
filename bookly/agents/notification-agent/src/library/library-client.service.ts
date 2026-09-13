import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { randomUUID } from 'crypto';

const LIBRARY_MCP_URL = process.env.LIBRARY_MCP_URL || 'http://localhost:8000';

export interface ToolResult {
  [key: string]: any;
}

@Injectable()
export class LibraryClientService {
  async executeTool(name: string, params: Record<string, any> = {}): Promise<ToolResult> {
    const response = await axios.post(
      `${LIBRARY_MCP_URL}/mcp/tools/${name}/execute`,
      { params },
      { headers: { 'x-correlation-id': randomUUID(), 'content-type': 'application/json' } },
    );
    return response.data;
  }
}
