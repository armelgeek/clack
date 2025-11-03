import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ProductOwner, ProductStatus } from 'types/enums/product';

export class FetchProductsByStoreDto {
  @ApiPropertyOptional({ example: '17', description: 'Category ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Product owner',
    example: ProductOwner.VAPOSTORE,
  })
  @IsOptional()
  @IsEnum(ProductOwner)
  owner?: ProductOwner;

  @ApiPropertyOptional({
    description: 'Product status',
    example: ProductStatus.ACTIVATED,
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({ example: 5, description: 'Threshold' })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  threshold?: number;

  @ApiPropertyOptional({ description: 'Number of items per page', example: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Page number', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Search term' })
  @IsString()
  @IsOptional()
  search?: string;
}
