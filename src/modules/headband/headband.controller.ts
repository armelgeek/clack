import { Controller } from '@nestjs/common';
import { HeadbandService } from './headband.service';
import { CreateHeadbandDto } from './dto/create-headband.dto';
import { Body, Post, Param, Patch , Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('banners')
@Controller('banner')
export class HeadbandController {
  constructor(private readonly headbandService: HeadbandService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new banner' })
  @ApiCreatedResponse({
    description: 'Banner successfully created',
    type: CreateHeadbandDto,
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiBody({ type: CreateHeadbandDto })
  async create(@Body() createHeadbandDto: CreateHeadbandDto) {
    return this.headbandService.create(createHeadbandDto.title, createHeadbandDto.description);
  }

  @Patch(':id/active')
  @ApiOperation({ summary: 'Toggle active status of a headband' })
  @ApiParam({ name: 'id', description: 'Headband identifier' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        isActive: { type: 'boolean', example: true },
      },
      required: ['isActive'],
    },
  })
  async updateActiveStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.headbandService.toggleIsActive(id, isActive);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update headband details' })
  @ApiParam({ name: 'id', description: 'Headband identifier' })
  @ApiBody({ type: CreateHeadbandDto })
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateHeadbandDto>,
  ) {
    return this.headbandService.update(id, updateData);
  }

  @Get()
  @ApiOperation({ summary: 'Get all headbands' })
  async findAll() {
    return this.headbandService.findAll();
  }

}
