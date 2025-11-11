import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ReturnOrderDto {
  @ApiProperty({ description: 'Reason for return' })
  @IsNotEmpty()
  @IsString()
  reason: string;
}
