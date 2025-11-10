import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, Min } from 'class-validator';
import { StockMovementType } from 'types/enums/product';

export class CreateStockMovementDto {
  @ApiProperty({
    description: 'Identifiant du produit associé au mouvement',
    example: '33ebb488-7431-498e-9c7b-51f2f2c992f3',
  })
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'Identifiant du magasin associé au produit',
    example: '33ebb488-7431-498e-9c7b-51f2f2c992f3',
  })
  @IsString()
  storeId: string;

  @ApiProperty({
    description: 'Type de mouvement',
    example: StockMovementType.IN,
  })
  @IsOptional()
  @IsEnum(StockMovementType)
  type: StockMovementType;

  @ApiProperty({
    description: 'Quantité initial du produit',
    example: 10,
  })
  @Transform(({ value }) => Number(value))
  @Min(0)
  quantity: number;
}
