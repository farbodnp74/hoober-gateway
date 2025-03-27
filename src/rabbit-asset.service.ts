import { Injectable } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

@Injectable()
export class RabbitAssetsService {
  private readonly client: ClientProxy;

  constructor() {
    // Create ClientProxy instance
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://rabbitmq:5672'],
        queue: 'asset_queue',
        queueOptions: { durable: true },
      },
    });
  }

  public async send(pattern: string, data: any) {
    try {

      return await this.client.send({cmd:pattern}, data).toPromise();
    } catch (error) {
      // Handle the error here, you can log it or perform any other actions
      console.error('Error occurred while sending asset_queue:', error);
      
    }
  }
}
