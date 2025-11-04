import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsObject, IsEnum, IsInt } from "class-validator";
import { Type } from "class-transformer";
import { StoreStatus } from "types/enums/store";

export class CreateStoreDto {
  @ApiProperty({
    description: "The name of the store.",
    example: "SuperMart Downtown",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: "URL of the store's logo.",
    example: "https://cdn.example.com/logos/supermart.png",
  })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiProperty({
    description: "The store's physical address.",
    example: "123 Main Street, Antananarivo, Madagascar",
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({
    description: "Geographical latitude of the store.",
    example: -18.8792,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({
    description: "Geographical longitude of the store.",
    example: 47.5079,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({
    description: "Phone number of the store.",
    example: "+261 34 12 345 67",
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: "Opening hours as a JSON object (example format).",
    example: {
      monday: "08:00 - 18:00",
      tuesday: "08:00 - 18:00",
      saturday: "09:00 - 14:00",
      sunday: "Closed",
    },
  })
  @IsOptional()
  @IsObject()
  openingHours?: Record<string, any>;

  @ApiPropertyOptional({
    description: "Current status of the store.",
    enum: StoreStatus,
    default: StoreStatus.ACTIVATED,
    example: StoreStatus.ACTIVATED,
  })
  @IsOptional()
  @IsEnum(StoreStatus)
  status?: StoreStatus = StoreStatus.ACTIVATED;

  @ApiPropertyOptional({
    description: "External company ID used for synchronization (if applicable).",
    example: 219,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  externalCompanyId?: number;

  @ApiPropertyOptional({
    description: "Folder ID where the store's documents are stored (if applicable).",
    example: "folder_12345",
  })
  @IsOptional()
  @IsString()
  folderId?: string;
}
