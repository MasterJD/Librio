import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ConsulService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ConsulService.name);
  private readonly consulHost = process.env.CONSUL_HOST || 'localhost';
  private readonly consulPort = process.env.CONSUL_PORT || '8500';
  private readonly serviceName = 'users-svc';
  private readonly servicePort = 8002;
  private registrationId: string | null = null;

  async onModuleInit() {
    await this.register();
  }

  async onModuleDestroy() {
    await this.deregister();
  }

  private async register() {
    try {
      const registration = {
        ID: `${this.serviceName}-${this.servicePort}`,
        Name: this.serviceName,
        Address: this.serviceName,
        Port: this.servicePort,
        Check: {
          HTTP: `http://${this.serviceName}:${this.servicePort}/healthz`,
          Interval: '10s',
          Timeout: '5s',
          DeregisterCriticalServiceAfter: '30s',
        },
      };

      await axios.put(
        `http://${this.consulHost}:${this.consulPort}/v1/agent/service/register`,
        registration,
      );

      this.registrationId = registration.ID;
      this.logger.log(`Service registered in Consul: ${this.serviceName}`);
    } catch (error) {
      this.logger.error(`Failed to register service in Consul: ${error.message}`);
    }
  }

  private async deregister() {
    if (!this.registrationId) return;

    try {
      await axios.put(
        `http://${this.consulHost}:${this.consulPort}/v1/agent/service/deregister/${this.registrationId}`,
      );
      this.logger.log(`Service deregistered from Consul: ${this.serviceName}`);
    } catch (error) {
      this.logger.error(`Failed to deregister service from Consul: ${error.message}`);
    }
  }

  async discover(serviceName: string): Promise<string | null> {
    try {
      const response = await axios.get(
        `http://${this.consulHost}:${this.consulPort}/v1/catalog/service/${serviceName}`,
      );

      if (response.data && response.data.length > 0) {
        const service = response.data[0];
        return `http://${service.ServiceAddress || service.ServiceName}:${service.ServicePort}`;
      }
      return null;
    } catch (error) {
      this.logger.error(`Failed to discover service ${serviceName}: ${error.message}`);
      return null;
    }
  }
}
