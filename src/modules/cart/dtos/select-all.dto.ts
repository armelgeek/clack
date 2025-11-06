import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class SelectAllDto {
  @ApiProperty({ description: 'Select all items' })
  @IsNotEmpty()
  @IsBoolean()
  isSelected: boolean;
}
