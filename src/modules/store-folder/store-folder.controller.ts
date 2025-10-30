import { Controller, Post, Body ,Get } from '@nestjs/common';
import { StoreFolderService } from './store-folder.service';
import { CreateStoreFolderDto } from './dto/create-store-folder.dto';
import { ApiOperation, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Store Folders')
@Controller('store-folders')
export class StoreFolderController {
  constructor(private service: StoreFolderService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un dossier ou sous-dossier' })
  @ApiBody({ type: CreateStoreFolderDto })
  @ApiResponse({
    status: 201,
    description: 'Le dossier a été créé avec succès.',
  })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  async create(@Body() body: CreateStoreFolderDto) {
    return this.service.createFolder(body.name, body.storeId, body.parentId);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les dossiers' })
  @ApiResponse({
    status: 200,
    description: 'Liste des dossiers récupérée avec succès.',
  })
  async findAll() {
    return this.service.getAllFolders();
  }
}
