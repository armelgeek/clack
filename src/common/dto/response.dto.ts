import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 10 })
  totalPages: number;
}

export class StoreResponseDto {
  @ApiProperty({ example: 'store-123' })
  id: string;

  @ApiProperty({ example: 'Vape Shop Paris' })
  name: string;

  @ApiProperty({ example: 'https://example.com/logo.png', required: false })
  logoUrl?: string;

  @ApiProperty({ example: '123 Rue de la Paix, 75001 Paris' })
  address: string;

  @ApiProperty({ example: 48.8566, required: false })
  latitude?: number;

  @ApiProperty({ example: 2.3522, required: false })
  longitude?: number;

  @ApiProperty({ example: '+33123456789', required: false })
  phoneNumber?: string;

  @ApiProperty({
    example: { monday: '9:00-18:00', tuesday: '9:00-18:00' },
    required: false,
  })
  openingHours?: any;

  @ApiProperty({ example: 'ACTIVATED' })
  status: string;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  updatedAt: Date;
}

export class PaginatedStoresResponseDto {
  @ApiProperty({ type: [StoreResponseDto] })
  data: StoreResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

export class ProductResponseDto {
  @ApiProperty({ example: 'product-123' })
  id: string;

  @ApiProperty({ example: 'store-123' })
  storeId: string;

  @ApiProperty({ example: 'E-liquid Strawberry' })
  name: string;

  @ApiProperty({ example: 'E-liquids' })
  category: string;

  @ApiProperty({ example: 'https://example.com/product.png', required: false })
  image?: string;

  @ApiProperty({ example: 10.5 })
  priceHT: number;

  @ApiProperty({ example: 12.6 })
  priceTTC: number;

  @ApiProperty({ example: '20%' })
  vat: string;

  @ApiProperty({ example: 'ACTIVATED' })
  status: string;

  @ApiProperty({ example: 50 })
  quantity: number;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  updatedAt: Date;
}

export class PaginatedProductsResponseDto {
  @ApiProperty({ type: [ProductResponseDto] })
  data: ProductResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
