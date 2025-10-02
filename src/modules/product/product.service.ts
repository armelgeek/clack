import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TProduct } from 'types/product';
import { PaginatedResponse, PaginationMeta } from 'types/common/pagination';
import { ProductRepository } from './product.repository';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(private readonly productRepository: ProductRepository) {}

  async getProductById(id: string): Promise<TProduct> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      this.logger.error('Product not found');
      throw new NotFoundException('Product not found');
    }

    return this.transformProduct(product);
  }

  async getAllProducts(
    page: number = 1,
    limit: number = 10,
    search?: string,
    category?: string
  ): Promise<PaginatedResponse<TProduct>> {
    const { data, total } = await this.productRepository.findAll(
      page,
      limit,
      search,
      category
    );

    const transformedData = data.map((product) =>
      this.transformProduct(product),
    );

    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };

    return {
      data: transformedData,
      meta,
    };
  }

  async getProductsByStoreId(
    storeId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    category?: string
  ): Promise<PaginatedResponse<TProduct>> {
    const { data, total } = await this.productRepository.findByStoreId(
      storeId,
      page,
      limit,
      search,
      category,
    );

    const transformedData = data.map((product) =>
      this.transformProduct(product),
    );

    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };

    return {
      data: transformedData,
      meta,
    };
  }

  private transformProduct(product: any): TProduct {
    return {
      id: product.id,
      storeId: product.storeId,
      name: product.name,
      category: product.category,
      image: product.image,
      priceHT: product.priceHT !== null ? Number(product.priceHT) : 0,
      priceTTC: product.priceTTC !== null ? Number(product.priceTTC) : 0,
      vat: product.vat,
      status: product.status,
      quantity: product.quantity !== null ? Number(product.quantity) : 0,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      deletedAt: product.deletedAt,
    };
  }
}
