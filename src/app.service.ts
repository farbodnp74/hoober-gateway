import { Resolver, Query, Args,Int } from '@nestjs/graphql';


@Resolver()
export class AppResolver {

  @Query(() => String)
  sayHello(): string {
    return 'Hello World!';
  }
}