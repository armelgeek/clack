import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class EstimateShippingDto {
  @ApiProperty({ description: 'Address ID' })
  @IsNotEmpty()
  @IsString()
  addressId: string;

  @ApiPropertyOptional({ description: 'Latitude for address' })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude for address' })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}
