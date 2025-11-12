import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ description: 'Message to send to driver' })
  @IsNotEmpty()
  @IsString()
  message: string;
}
