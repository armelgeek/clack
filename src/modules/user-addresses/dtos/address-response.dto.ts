import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddressResponseDto {
  @ApiProperty({ description: 'Address ID' })
  id: string;

  @ApiProperty({ description: 'Address label (home, work, other)' })
  label: string;

  @ApiProperty({ description: 'Street address' })
  streetAddress: string;

  @ApiProperty({ description: 'City' })
  city: string;

  @ApiPropertyOptional({ description: 'State/Province' })
  state?: string;

  @ApiProperty({ description: 'Postal code' })
  postalCode: string;

  @ApiProperty({ description: 'Country' })
  country: string;

  @ApiPropertyOptional({ description: 'Latitude', type: Number })
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude', type: Number })
  longitude?: number;

  @ApiPropertyOptional({ description: 'Is default address', type: Boolean })
  isDefault?: boolean;

  @ApiProperty({ description: 'Creation date (ISO 8601)' })
  createdAt: string;

  @ApiProperty({ description: 'Last update date (ISO 8601)' })
  updatedAt: string;
}

export class GetAddressesResponseDto {
  @ApiProperty({ type: [AddressResponseDto] })
  addresses: AddressResponseDto[];
}
