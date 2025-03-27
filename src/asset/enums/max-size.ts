import { registerEnumType } from "@nestjs/graphql";

export enum MaxSizeEnum {
    FIFTY_MG =  50 * 1_000_000,
  
}

registerEnumType(MaxSizeEnum, {
  name: "MaxSizeEnum",
});
