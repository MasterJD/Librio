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
  name: 'Bookly Transaction Agent',
  description: 'Agente especializado en rentas y compras de libros',
  url: 'http://transaction-agent:9002',
  skills: [
    { id: 'create_rental', name: 'create_rental', description: 'Renta un libro para un usuario' },
    { id: 'purchase_book', name: 'purchase_book', description: 'Compra un libro para un usuario' },
    { id: 'return_book', name: 'return_book', description: 'Devuelve un libro rentado' },
    { id: 'get_my_library', name: 'get_my_library', description: 'Obtiene la biblioteca del usuario' },
  ],
};

@Controller('.well-known')
export class AgentCardController {
  @Get('agent.json')
  getCard(): AgentCard {
    return AGENT_CARD;
  }
}