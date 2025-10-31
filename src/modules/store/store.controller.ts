import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { StoreService } from './store.service';
import { ProductService } from '../product/product.service';
import { TStore } from 'types/store';
import { TProduct } from 'types/product';
import { PaginatedResponse } from 'types/common/pagination';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import {
  PaginatedStoresResponseDto,
  StoreResponseDto,
  PaginatedProductsResponseDto,
} from '@/common/dto/response.dto';
import { StoreSearchDto, SearchDto } from '@/common/dto/pagination.dto';
import { FetchProductsByStoreDto } from '../product/dtos/fetch-products-by-store-id.dto';
import { BasicListResponse } from 'types/common/response';
import { UpdateStoreDto } from './dtos/update-store.dto';

@ApiTags('stores')
@Controller('stores')
export class StoreController {
  constructor(
    private readonly storeService: StoreService,
    private readonly productService: ProductService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all stores with pagination and search' })
  @ApiResponse({
    status: 200,
    description: 'Stores fetched successfully',
    type: PaginatedStoresResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error while fetching stores',
  })
  async getAll(
    @Query() query: StoreSearchDto,
  ): Promise<PaginatedResponse<TStore>> {
    return this.storeService.getAllStores(
      query.page || 1,
      query.limit || 10,
      query.search,
      query.region,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get store by id' })
  @ApiParam({ name: 'id', description: 'Store ID' })
  @ApiResponse({
    status: 200,
    description: 'Store fetched successfully',
    type: StoreResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Store not found',
    type: null,
  })
  @ApiResponse({
    status: 500,
    description: 'Error while fetching store',
  })
  getOne(@Param('id') id: string): Promise<TStore> {
    return this.storeService.getStoreById(id);
  }

  @Get(':id/products')
  @ApiOperation({ summary: 'Get all products for a specific store' })
  @ApiParam({ name: 'id', description: 'Store ID' })
  @ApiResponse({
    status: 200,
    description: 'Products fetched successfully',
    type: PaginatedProductsResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error while fetching products',
  })
  async getStoreProducts(
    @Param('id') storeId: string,
    @Query() query: SearchDto,
  ): Promise<PaginatedResponse<TProduct>> {
    return this.productService.getProductsByStoreId(
      storeId,
      query.page || 1,
      query.limit || 10,
      query.search,
    );
  }

  @Get(':id/products/filtered')
  @ApiOperation({ summary: 'Fetch products' })
  @ApiResponse({ status: 200, description: 'Products fetched successfully' })
  @ApiResponse({
    status: 500,
    description: 'Error while fetching products',
  })
  async fetchProductsByStoreId(
    @Param('id') storeId: string,
    @Query() data: FetchProductsByStoreDto,
  ): Promise<BasicListResponse<TProduct>> {
    const products = await this.productService.fetchFilteredProductsByStoreId(
      storeId,
      data,
    );
    return products;
  }

  @Put(':storeId')
  @ApiOperation({ summary: 'Update store' })
  @ApiResponse({
    status: 200,
    description: 'Store updated successfully',
  })
  @ApiResponse({
    status: 500,
    description: `Error while updating store`,
  })
  async updateStore(
    @Param('storeId') storeId: string,
    @Body() dto: UpdateStoreDto,
  ): Promise<{
    id: string;
    name: string;
    phoneNumber: string;
    createdAt: Date;
    updatedAt: Date;
    status: string;
    logoUrl: string;
    address: string;
    latitude: string;
    longitude: string;
    openingHours: unknown;
    deletedAt: Date;
  }> {
    return this.storeService.updateStore(storeId, dto);
  }
}
