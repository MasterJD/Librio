import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { StructuredLogger } from '../logger/logger.service';

const CATALOG_AGENT_URL = process.env.CATALOG_AGENT_URL || 'http://localhost:9001';
const TRANSACTION_AGENT_URL = process.env.TRANSACTION_AGENT_URL || 'http://localhost:9002';
const NOTIFICATION_AGENT_URL = process.env.NOTIFICATION_AGENT_URL || 'http://localhost:9003';

export interface AgentSkill {
  id: string;
  name: string;
  description: string;
}

export interface AgentCard {
  name: string;
  description: string;
  url: string;
  skills: AgentSkill[];
}

@Injectable()
export class AgentDiscoveryService {
  private readonly logger = new StructuredLogger('orchestrator-agent');

  private readonly registry: Record<string, string> = {
    'catalog-agent': CATALOG_AGENT_URL,
    'transaction-agent': TRANSACTION_AGENT_URL,
    'notification-agent': NOTIFICATION_AGENT_URL,
  };

  async discoverAll(): Promise<AgentCard[]> {
    const cards: AgentCard[] = [];
    for (const [name, url] of Object.entries(this.registry)) {
      try {
        const response = await axios.get(`${url}/.well-known/agent.json`, {
          timeout: 3000,
        });
        cards.push({ ...response.data, url });
      } catch (error: any) {
        this.logger.warn(`Could not discover agent card for ${name}`, undefined, {
          payload: { agent: name, error: error.message },
        });
      }
    }
    return cards;
  }

  async discover(name: string): Promise<AgentCard | null> {
    const url = this.registry[name];
    if (!url) return null;
    try {
      const response = await axios.get(`${url}/.well-known/agent.json`, { timeout: 3000 });
      return { ...response.data, url };
    } catch (error: any) {
      this.logger.warn(`Agent card not reachable: ${name}`, undefined, {
        payload: { agent: name, error: error.message },
      });
      return null;
    }
  }

  async hasSkill(agent: string, skill: string): Promise<boolean> {
    const card = await this.discover(agent);
    return !!card?.skills?.some((s) => s.id === skill);
  }
}