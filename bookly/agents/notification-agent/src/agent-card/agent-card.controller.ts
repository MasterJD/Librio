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
  name: 'Bookly Notification Agent',
  description: 'Agente especializado en enviar notificaciones',
  url: 'http://notification-agent:9003',
  skills: [
    { id: 'send_notification', name: 'send_notification', description: 'Envía una notificación al usuario' },
    { id: 'get_notification_history', name: 'get_notification_history', description: 'Obtiene el historial de notificaciones de un usuario' },
  ],
};

@Controller('.well-known')
export class AgentCardController {
  @Get('agent.json')
  getCard(): AgentCard {
    return AGENT_CARD;
  }
}