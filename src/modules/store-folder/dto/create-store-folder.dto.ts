import { IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateStoreFolderDto {
  @ApiProperty({ description: "Nom du dossier" })
  @IsString()
  name: string;

  @ApiProperty({ description: "ID du magasin associé (optionnel)", required: false })
  @IsOptional()
  @IsString()
  storeId?: string;

  @ApiProperty({ description: "ID du dossier parent (optionnel)", required: false })
  @IsOptional()
  @IsString()
  parentId?: string;
}