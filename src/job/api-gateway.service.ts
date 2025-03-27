import { Injectable } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';


@Injectable()
export class ApiGatewayService {
  private jobService: ClientProxy;

  constructor() {
    
    this.jobService = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://rabbitmq:5672'],
        queue: 'job_queue',
        queueOptions: { durable: true },
      },
    });
  }
}
