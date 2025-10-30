import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { TProduct, TClientProduct } from 'types/product';
import { PaginatedResponse, PaginationMeta } from 'types/common/pagination';
import { ProductRepository } from './product.repository';
import { ProductImagesRepository } from './productImages.repository';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { firstValueFrom } from 'rxjs';
import { FetchProductsByCategoryDto } from './dtos/fetch-products-by-category.dto';
import { BasicListResponse } from 'types/common/response';
import { generateBasicAuthToken } from 'utils/auth';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);
  private readonly nextoreApiUrl: string;
  private readonly basicAuthToken: string;

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productImagesRepository: ProductImagesRepository,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    const nextoreApi = this.configService.get('nextoreApi');
    if (nextoreApi && nextoreApi.username && nextoreApi.password) {
      const username = nextoreApi.username;
      const password = nextoreApi.password;
      this.nextoreApiUrl = nextoreApi.url;
      this.basicAuthToken = generateBasicAuthToken(username, password);
    }
  }

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

    const transformedData = await Promise.all(data.map((product) =>
      this.transformProduct(product),
    ));

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

    const transformedData = await Promise.all(data.map((product) =>
      this.transformProduct(product),
    ));

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
    return Promise.all(similarProducts.map((p) => this.transformProduct(p)));
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
      priceHT: product.priceHT !== null ? Number(product.priceHT) : 0,
      priceTTC: product.priceTTC !== null ? Number(product.priceTTC) : 0,
      vat: product.vat,
      owner: product.owner,
      status: product.status,
      quantity: product.quantity !== null ? Number(product.quantity) : 0,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      deletedAt: product.deletedAt,
    };
  }

  // Methods for sync functionality from superadmin
  async fetchProductsByCategory(
    params: FetchProductsByCategoryDto,
  ): Promise<BasicListResponse<TClientProduct>> {
    const allProducts = await this.fetchAndCacheAllProductsByCategory(params);

    const filteredProducts = params.search
      ? allProducts.filter((product) =>
          product.name.toLowerCase().includes(params.search.toLowerCase()),
        )
      : allProducts;

    return {
      data: filteredProducts,
      total: filteredProducts.length,
    };
  }

  async getCountForStore(storeId: string) {
    return this.productRepository.countProductsByStoreId(storeId);
  }

  async getTotalProductCount() {
    return this.productRepository.countAllProducts();
  }

  private async fetchAndCacheAllProductsByCategory(
    params: FetchProductsByCategoryDto,
  ): Promise<TClientProduct[]> {
    const cacheKey = `products:${params.companyId}:${params.categoryId}`;

    const cached = await this.cacheManager.get<TClientProduct[]>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for ${cacheKey}`);
      return cached;
    }

    this.logger.debug(`Cache miss for ${cacheKey}, fetching from API...`);

    const url = `${this.nextoreApiUrl}/products/productsByCategory`;

    const response = await firstValueFrom(
      this.httpService.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${this.basicAuthToken}`,
        },
        data: {
          company_id: params.companyId,
          category_id: params.categoryId,
        },
      }),
    );

    const products = response.data.data;

    await this.cacheManager.set(cacheKey, products, 1000 * 60 * 5);

    return products;
  }
}
