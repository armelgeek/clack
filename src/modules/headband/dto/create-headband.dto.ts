import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHeadbandDto {
  @ApiProperty({
    example: 'Annonces',
    description: 'Title of the headband',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Sotck disponible',
    description: 'Detailed description',
  })
  @IsNotEmpty()
  @IsString()
  description: string;
}
