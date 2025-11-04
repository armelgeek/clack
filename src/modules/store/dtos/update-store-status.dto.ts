import { IsEnum } from "class-validator";
import { StoreStatus } from "types/enums/store";

export class UpdateStoreStatusDto {
  @IsEnum(StoreStatus)
  status: StoreStatus;
}
