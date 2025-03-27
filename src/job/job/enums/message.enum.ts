import { registerEnumType } from "@nestjs/graphql";

export enum MessageEnum {
  EXPIRED = "قیمت منقضی شده است",
  NOT_EXPIRED = "قیمت صحیح است" 
}

registerEnumType(MessageEnum, { name: "MessageEnum" });
