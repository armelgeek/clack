import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, Min } from 'class-validator';
import {
  HasMimeType,
  IsFiles,
  MaxFileSize,
  MemoryStoredFile,
} from 'nestjs-form-data';
import { ProductStatus } from 'types/enums/product';

export class UpdateProductDto {
  @IsString()
  storeId: string;

  @ApiPropertyOptional({
    description: 'ID de la catégorie du produit',
    example: '39ebb488-7431-498e-9c7b-61f2f2c992f3',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Nom du produit',
    example: 'Vapo fruit',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Description du produit',
    example: 'Vapo fruit de la marque Vapo',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Prix TTC du produit',
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @Min(0)
  priceTTC: number;

  @ApiPropertyOptional({
    description: 'Product status',
    example: ProductStatus.ACTIVATED,
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status: ProductStatus;

  @IsFiles()
  @MaxFileSize(50e6, { each: true })
  @HasMimeType(['image/*'], { each: true })
  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'file' },
    description: 'Array of  product images',
    required: true,
  })
  @IsOptional()
  images: MemoryStoredFile[];
}
