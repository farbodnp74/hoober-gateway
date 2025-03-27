import { registerEnumType } from "@nestjs/graphql";

export enum DirectoryType {
    MOBILE =  'banner/mobile',
    
  
}

registerEnumType(DirectoryType, {
  name: "DirectoryType",
});
