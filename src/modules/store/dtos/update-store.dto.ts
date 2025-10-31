import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { StoreStatus } from 'types/enums/store';

export class UpdateStoreDto {
  @ApiPropertyOptional({
    description: 'Store status',
    example: StoreStatus.ACTIVATED,
  })
  @IsEnum(StoreStatus)
  @IsOptional()
  status?: StoreStatus;
}
