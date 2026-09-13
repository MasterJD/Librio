import { Controller, Get } from '@nestjs/common';

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

export const AGENT_CARD: AgentCard = {
  name: 'Bookly Catalog Agent',
  description: 'Agente especializado en buscar y consultar libros',
  url: 'http://catalog-agent:9001',
  skills: [
    { id: 'search_books', name: 'search_books', description: 'Search books by title or genre' },
    { id: 'get_book', name: 'get_book', description: 'Get book details by ID' },
  ],
};

@Controller('.well-known')
export class AgentCardController {
  @Get('agent.json')
  getCard(): AgentCard {
    return AGENT_CARD;
  }
}