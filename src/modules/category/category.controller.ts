import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { TCategory } from 'types/category';
import { ProductService } from '../product/product.service';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly productService: ProductService,
  ) {}

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

  @Get(':categoryId/products')
  @ApiOperation({ summary: 'Get products by category' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Products fetched successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async getProductsByCategory(
    @Param('categoryId') categoryId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.productService.getAllProducts(
      page || 1,
      limit || 10,
      search,
      categoryId,
    );
  }
}
