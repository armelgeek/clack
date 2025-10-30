import { IsNotEmpty, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStoreUserStatusDto {
  @ApiProperty({
    description: 'User identifier',
    example: 'uuid-user-id-456',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Active status (true = active, false = inactive)',
    example: true,
  })
  @IsBoolean()
  status: boolean;
}