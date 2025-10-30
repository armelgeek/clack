import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class FetchProductsByCategoryDto {
  @ApiProperty({ example: 219, description: 'Company ID' })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  companyId: number;

  @ApiProperty({ example: 17, description: 'Category ID' })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  categoryId: number;

  @ApiPropertyOptional({ description: 'Search term' })
  @IsString()
  @IsOptional()
  search?: string;
}
