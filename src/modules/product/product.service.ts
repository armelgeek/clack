import {
  Injectable,
  Logger,
  NotFoundException,
  Inject,
  ConflictException,
} from '@nestjs/common';
import { TProduct, TClientProduct } from 'types/product';
import { PaginatedResponse, PaginationMeta } from 'types/common/pagination';
import {
  ProductRepository,
  UpdateProductImagesData,
} from './product.repository';
import { ProductImagesRepository } from './productImages.repository';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { firstValueFrom } from 'rxjs';
import { FetchProductsByCategoryDto } from './dtos/fetch-products-by-category.dto';
import { BasicListResponse } from 'types/common/response';
import { generateBasicAuthToken } from 'utils/auth';
import { FetchProductsByStoreDto } from './dtos/fetch-products-by-store-id.dto';
import { ProductStatus } from 'types/enums/product';
import { MemoryStoredFile } from 'nestjs-form-data';
import { v4 as uuidv4 } from 'uuid';
import { FileUploaderService } from '../file-uploader/services/file-uploader.service';
import {
  CreateProductDto,
  CreateProductImageData,
} from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';

export interface UploadedFileResponse {
  url: string;
  filename: string;
  objectKey: string;
}

interface CustomMemoryStoredFile extends MemoryStoredFile {
  name?: string;
}

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);
  private readonly nextoreApiUrl: string;
  private readonly basicAuthToken: string;
  private readonly VAT_RATE = 0.2;

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productImagesRepository: ProductImagesRepository,
    private fileUploaderService: FileUploaderService,
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
    category?: string,
  ): Promise<PaginatedResponse<TProduct>> {
    const { data, total } = await this.productRepository.findAll(
      page,
      limit,
      search,
      category,
    );

    const transformedData = await Promise.all(
      data.map((product) => this.transformProduct(product)),
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
    category?: string,
  ): Promise<PaginatedResponse<TProduct>> {
    const { data, total } = await this.productRepository.findByStoreId(
      storeId,
      page,
      limit,
      search,
      category,
    );

    const transformedData = await Promise.all(
      data.map((product) => this.transformProduct(product)),
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
      const imgs = await this.productImagesRepository.findByProductId(
        product.id,
      );
      images = imgs.map((img) => img.url);
      image = images.length > 0 ? images[0] : undefined;
    } else if (product.owner) {
      const imgs = await this.productImagesRepository.findByProductId(
        product.id,
      );
      images = imgs.map((img) => img.url);
    }
    return {
      id: product.id,
      storeId: product.storeId,
      name: product.name,
      category: product.category,
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

  // Service methods for store admin
  async getProductDetailsById(id: string): Promise<TProduct> {
    const product = await this.productRepository.getProductDetailsById(id);

    if (!product) {
      this.logger.error('Product not found');
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async fetchFilteredProductsByStoreId(
    storeId: string,
    params: FetchProductsByStoreDto,
  ): Promise<BasicListResponse<TProduct>> {
    try {
      const allProducts =
        await this.productRepository.fetchFilteredProductsByStoreId(
          storeId,
          params,
        );
      const totalItems =
        await this.productRepository.countFilteredProductsByStoreId(
          storeId,
          params,
        );

      return {
        data: allProducts,
        total: totalItems,
      };
    } catch (e) {
      this.logger.error('Error fetching out of stock products', e);
    }
  }

  async updateProductStatus(productId: string, status: ProductStatus) {
    const product = this.getProductById(productId);

    if (!product) {
      this.logger.error('Product not found');
      throw new NotFoundException('Product not found');
    }

    const updatedProduct = await this.productRepository.updateProductStatus(
      productId,
      status,
    );
    return updatedProduct;
  }

  private async handleUploadProductImages(
    images: MemoryStoredFile[],
    storeId: string,
  ): Promise<UploadedFileResponse[]> {
    try {
      const uploadPromises = images.map(async (image, index) => {
        const fileExtension = image.originalName.split('.').pop() || 'jpg';
        const uniqueId = uuidv4();

        const objectName = `products/${storeId}/${uniqueId}_${index}.${fileExtension}`;

        const uploadedImage = await this.fileUploaderService.uploadFile(
          image,
          objectName,
        );

        return {
          url: uploadedImage.url,
          filename: uploadedImage.filename,
          objectKey: uploadedImage.objectKey,
        };
      });

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Failed to upload product image:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  async createProduct(dto: CreateProductDto) {
    const priceHT = dto.priceTTC / (1 + this.VAT_RATE);

    const uploadedUrls = await this.handleUploadProductImages(
      dto.images,
      dto.storeId,
    );

    const productData = {
      ...dto,
      id: uuidv4(),
      priceHT: priceHT,
      vat: (this.VAT_RATE * 100).toFixed(2) + '%',
    };

    // TODO: Avoid creating a new other product which already exists
    const existingProduct = await this.productRepository.getOtherProductByName(
      productData.name,
    );
    if (existingProduct) {
      this.logger.error('Product already exists');
      throw new ConflictException('Product already exists');
    }

    const newProduct = await this.productRepository.createProductWithImages(
      productData,
      uploadedUrls,
    );

    return newProduct;
  }

  async deleteProduct(productId: string) {
    try {
      const product = await this.productRepository.getProductById(productId);

      if (!product) {
        this.logger.error('Product not found');
        throw new NotFoundException('Product not found');
      }

      const deletedProduct =
        await this.productRepository.deleteProduct(productId);

      return deletedProduct;
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw new Error(`Delete product failed: ${error.message}`);
    }
  }

  async updateProduct(productId: string, updateProductDto: UpdateProductDto) {
    const { images, ...productData } = updateProductDto;
    const imageData: CustomMemoryStoredFile[] =
      images as CustomMemoryStoredFile[];

    const oldImageFiles =
      imageData?.filter((file) => file.name && file.name.startsWith('http')) ||
      [];

    const newImageFiles =
      imageData?.filter(
        (file) => !file.name || !file.name.startsWith('http'),
      ) || [];

    const imagesToKeepUrls: string[] = oldImageFiles.map(
      (file) => file.name as string,
    );

    let newImagesData: CreateProductImageData[] = [];

    if (newImageFiles.length > 0) {
      const uploadedResponses: UploadedFileResponse[] =
        await this.handleUploadProductImages(
          newImageFiles as MemoryStoredFile[],
          updateProductDto.storeId,
        );

      newImagesData = uploadedResponses.map((res) => ({
        ...res,
        storeId: updateProductDto.storeId,
      }));
    }

    let priceHT: number | undefined;
    let vat: string | undefined;

    if (productData.priceTTC !== undefined) {
      priceHT = productData.priceTTC / (1 + this.VAT_RATE);
      vat = (this.VAT_RATE * 100).toFixed(2) + '%';
    }

    const productDataForUpdate = {
      ...productData,
      ...(priceHT !== undefined && { priceHT }),
      ...(vat !== undefined && { vat }),
    };

    const imageUpdateData: UpdateProductImagesData = {
      imagesToKeepUrls,
      newImagesData,
    };

    const updatedProduct = await this.productRepository.updateProduct(
      productId,
      productDataForUpdate,
      imageUpdateData,
    );

    return updatedProduct;
  }
}
