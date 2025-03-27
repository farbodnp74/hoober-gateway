import { Injectable } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

@Injectable()
export class RabbitMQService {
  private readonly client: ClientProxy;

  constructor() {
    // Create ClientProxy instance
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://rabbitmq:5672'],
        queue: 'job_queue',
        queueOptions: { durable: true },
      },
    });
  }

  public async send(pattern: string, data: any) {
    try {

      return await this.client.send({cmd:pattern}, data).toPromise();
    } catch (error) {
      console.error('Error occurred while sending message:', error);
    }
  }
}
