import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { TCategory } from 'types/category';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({
    summary: 'Create category',
  })
  @ApiResponse({
    status: 200,
    description: 'Category created successfully',
  })
  @ApiResponse({
    status: 500,
    description: 'Error while creating category',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  async createCategory(@Body() dto: CreateCategoryDto): Promise<TCategory> {
    return await this.categoryService.createCategory(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Fetch categories' })
  @ApiResponse({ status: 200, description: 'Categories fetched successfully' })
  @ApiResponse({
    status: 500,
    description: 'Error while fetching categories',
  })
  async fetchAllCategories(): Promise<TCategory[]> {
    const categories = await this.categoryService.fetchAllCategories();
    return categories;
  }

  @Get(':categoryId')
  @ApiOperation({ summary: 'Get category by id' })
  @ApiResponse({
    status: 200,
    description: 'Category fetched successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
    type: null,
  })
  @ApiResponse({
    status: 500,
    description: 'Error while fetching category',
  })
  getCategoryById(@Param('categoryId') categoryId: string): Promise<TCategory> {
    return this.categoryService.getCategoryById(categoryId);
  }
}
