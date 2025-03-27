import { registerEnumType } from "@nestjs/graphql";

export enum SortFieldProduct {
  RATING = 'rating',
  TIME = 'createdAt',
  NAME = 'name',
}

registerEnumType(SortFieldProduct, {
  name: "SortFieldProduct",
});
