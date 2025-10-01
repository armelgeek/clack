import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min, Max } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    description: 'Page number',
    default: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    default: 10,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class SearchDto extends PaginationDto {
  @ApiProperty({
    description: 'Search query',
    required: false,
  })
  @IsOptional()
  search?: string;
}

export class StoreSearchDto extends SearchDto {
  @ApiProperty({
    description: 'Filter by region/address',
    required: false,
  })
  @IsOptional()
  region?: string;
}
