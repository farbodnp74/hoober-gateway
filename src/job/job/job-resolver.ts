import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { Public } from 'src/base/public.decorator';
import {ValidationPipe } from "@nestjs/common";
import { ParentjobDTO } from '../parent/dto/parentjobDTO';
import { IndexParentInput } from '../parent/dto/index-parent.input';
import { jobService } from './job.service';
import { jobDTO } from './dto/jobDTO';
import { PaginationjobResponse } from './dto/pagination-job.response';
import { IndexjobInput } from './dto/index-job.input';
import { Permission } from "src/users/authorization/permission.decorator";
import { CurrentUser } from "src/users/auth/decorators/current-user.decorator";
import { User } from 'src/users/user/entities/user.entity';
import { CreatejobInput } from './dto/create-job.input';
import { UpdatejobInput } from './dto/update-job.input';
import { IsCacheEnabled } from 'src/base/cache.decorator';
@Resolver(() => ParentjobDTO)
export class jobResolver {
  constructor(private readonly jobService : jobService) {}

  @Public()
  @Query(() => PaginationjobResponse, { name: 'jobs' })
  paginatejob
    ( 
      @Args('indexjobInput', { type: () => IndexjobInput, nullable: true }, new ValidationPipe({ transform: true }))
      indexjobInput: IndexjobInput,
      @CurrentUser() user?: User,  
    ) : Promise<PaginationjobResponse>  {

    return this.jobService.pagination(indexjobInput,user);
  }

  @Permission("gql.jobs.job.store")
  @Mutation(() => jobDTO)
  createjob(
    @Args("createjobInput") createjobInput: CreatejobInput,
    @CurrentUser() user: User,
  ) {
    return this.jobService.create(createjobInput, user);
  }

  @Public()
  @Query(() => jobDTO, { name: 'job' })
  findOnejob(
    @Args("id", {type: () => Int}) id: number,
    @IsCacheEnabled() isCacheEnabled: boolean, 
  ) : Promise<jobDTO> {
    return this.jobService.findOne(id,isCacheEnabled)
  }

  @Public()
  @Query(() => [jobDTO], { name: 'similarjob' })
  similarjob(
    @Args("id", {type: () => Int}) id: number
  ): Promise<jobDTO[]>  {
    return this.jobService.similarjob(id);
  } 

  @Public()
  @Mutation(() => Boolean, { name: 'removejob' })
  removejob(
    @Args("id", { type: () => Int }) id: number
  ) : Promise<boolean> {
    return this.jobService.remove(id);
  }

  @Permission("gql.jobs.job.update")
  @Mutation(() => jobDTO, { name: 'createVarientFromExistjob' })
  createVarientFromExistjob(
    @Args("orginal_produtc_id", { type: () => Int }) orginal_produtc_id: number,
    @Args("similar_produtc_id", { type: () => Int }) similar_produtc_id: number,
    @Args("attribuite_id", { type: () => Int }) attribuite_id: number,
    @Args("similar_value_id", { type: () => Int }) similar_value_id: number,
    @Args("orginal_value_id", { type: () => Int }) orginal_value_id: number,
  ) : Promise<jobDTO> {
    return this.jobService.createVarientFromExistjob(
      orginal_produtc_id,
      similar_produtc_id,
      attribuite_id,
      similar_value_id,
      orginal_value_id
    );
  }

  @Permission("gql.jobs.job.update")
  @Mutation(() => jobDTO)
  updatejob(
    @Args("updatejobInput") updatejobInput: UpdatejobInput,
  ) {
    return this.jobService.update(
      updatejobInput.id,
      updatejobInput,
    );
  }

}
