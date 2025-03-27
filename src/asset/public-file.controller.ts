import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipeBuilder,
  ParseUUIDPipe,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { CurrentUser } from "src/users/auth/decorators/current-user.decorator";
import { Permission } from "src/users/authorization/permission.decorator";
import { User } from "src/users/user/entities/user.entity";
import { CreateFilePublicDto } from "./dto/create-file.public.dto";
import { MaxSizeEnum } from "./enums/max-size";
import { AssetService } from "./asset.service";
import { FileDTO } from "./dto/fileDTO";

@Controller("asset")
export class PublicFileController {
  constructor(private readonly fileService: AssetService,
  ) { }
  @Post()
  @UseInterceptors(FileInterceptor("file"))
  @Permission("rest.base.storage.file.store")
  create(
    @Body() createFileDto: CreateFilePublicDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType:
          /tgz|tar|zip|rar|xlsx|xls|odt|png|gif|tiff|jpg|jpeg|bmp|svg|txt|doc|docx|rtf|pdf/,
        })
        .addMaxSizeValidator({ maxSize: MaxSizeEnum.FIFTY_MG}) 
        .build({ fileIsRequired: true }),
    )
    file: Express.Multer.File,
    @CurrentUser() user: User,
  ) :  Promise<FileDTO>{
    return this.fileService.create(createFileDto, file, user);
  }

}
