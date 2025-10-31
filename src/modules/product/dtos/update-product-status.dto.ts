import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ProductStatus } from 'types/enums/product';

export class UpdateProductStatusDto {
  @ApiPropertyOptional({
    description: 'Product status',
    example: ProductStatus.ACTIVATED,
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status: ProductStatus;
}
