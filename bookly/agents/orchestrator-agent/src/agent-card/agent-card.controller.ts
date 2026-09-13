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
  name: 'Bookly Orchestrator Agent',
  description:
    'Coordina agentes especializados para procesar instrucciones del usuario (A2A)',
  url: 'http://orchestrator-agent:9000',
  skills: [
    {
      id: 'process_instruction',
      name: 'Procesar instrucción',
      description:
        'Recibe una instrucción en lenguaje natural y la delega al agente apropiado',
    },
  ],
};

@Controller('.well-known')
export class AgentCardController {
  @Get('agent.json')
  getCard(): AgentCard {
    return AGENT_CARD;
  }
}