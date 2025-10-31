import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, Max, Min } from 'class-validator';

export class UpdatePreferencesDto {
  @ApiPropertyOptional({
    description: 'If the user decided to be notified or not',
    example: true,
  })
  @IsBoolean()
  isNotified?: boolean;

  @ApiPropertyOptional({
    description: 'Minimum threshold for the user to be notified',
    example: 1,
  })
  @Transform(({ value }) => Number(value))
  @Min(1)
  @Max(10)
  minThreshold?: number;
}
