import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import {
  HasMimeType,
  IsFiles,
  MaxFileSize,
  MemoryStoredFile,
} from 'nestjs-form-data';
import { ProductStatus } from 'types/enums/product';

export interface CreateProductImageData {
  url: string;
  filename: string;
  objectKey: string;
}

export class CreateProductDto {
  @ApiProperty({
    description: 'Identifiant du magasin associé au produit',
    example: '33ebb488-7431-498e-9c7b-51f2f2c992f3',
  })
  @IsString()
  storeId: string;

  @ApiProperty({
    description: 'ID de la catégorie',
    example: '39ebb488-7431-498e-9c7b-61f2f2c992f3',
  })
  @IsString()
  category: string;

  @ApiProperty({
    description: 'Nom du produit',
    example: 'Vapo fruit',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description du produit',
    example: 'Vapo fruit de la marque Vapo',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Prix TTC du produit',
    example: 1,
  })
  @Transform(({ value }) => Number(value))
  @Min(0)
  priceTTC: number;

  @ApiProperty({
    description: 'Quantité initial du produit',
    example: 10,
  })
  @Transform(({ value }) => Number(value))
  @Min(0)
  quantity: number;

  @ApiProperty({
    description: 'Product status',
    example: ProductStatus.ACTIVATED,
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status: ProductStatus;

  @IsFiles()
  @MaxFileSize(50e6, { each: true })
  @HasMimeType(['image/*'], { each: true })
  @ApiProperty({
    type: 'array',
    items: { type: 'file' },
    description: 'Array of  product images',
    required: true,
  })
  images: MemoryStoredFile[];
}
