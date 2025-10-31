import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'ID de la categorie',
    example: '17',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Nom de la categorie',
    example: 'E-liquide',
  })
  @IsString()
  name: string;
}
