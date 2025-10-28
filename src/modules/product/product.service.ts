import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TProduct } from 'types/product';
import { PaginatedResponse, PaginationMeta } from 'types/common/pagination';
import { ProductRepository } from './product.repository';
import { ProductImagesRepository } from './productImages.repository';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productImagesRepository: ProductImagesRepository,
  ) {}

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

    const transformedData = await Promise.all(data.map((product) => this.transformProduct(product)));

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

    const transformedData = await Promise.all(data.map((product) => this.transformProduct(product)));

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

  async getSimilarProducts(productId: string): Promise<TProduct[]> {
    const product = await this.getProductById(productId);
    const similarProducts = await this.productRepository.findSimilar(
      productId,
      product.category,
    );
    return await Promise.all(similarProducts.map((p) => this.transformProduct(p)));
  }

  private async transformProduct(product: any): Promise<TProduct> {
    let images: string[] = [];
    let image: string | undefined = product.image;
    if (product.owner === 'VAPOSTORE') {
      const imgs = await this.productImagesRepository.findByProductId(product.id);
      images = imgs.map(img => img.url);
      image = images.length > 0 ? images[0] : undefined;
    } else if (product.owner) {
      const imgs = await this.productImagesRepository.findByProductId(product.id);
      images = imgs.map(img => img.url);
    }
    return {
      id: product.id,
      storeId: product.storeId,
      name: product.name,
      category: product.category,
      image,
      images,
      priceHT: typeof product.priceHT === 'number' ? product.priceHT : Number(product.priceHT ?? 0),
      priceTTC: typeof product.priceTTC === 'number' ? product.priceTTC : Number(product.priceTTC ?? 0),
      vat: product.vat,
      owner: product.owner,
      status: product.status,
      quantity: typeof product.quantity === 'number' ? product.quantity : Number(product.quantity ?? 0),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      deletedAt: product.deletedAt,
    };
  }
}
