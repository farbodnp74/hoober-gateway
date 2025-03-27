import { registerEnumType } from "@nestjs/graphql";

export enum BasketType {
    VARDAST =  "vardast",
    
  
}

registerEnumType(BasketType, {
  name: "BasketType",
});
