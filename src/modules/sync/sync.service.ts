import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ProductRepository } from '../product/product.repository';
import { ProductService } from '../product/product.service';
import { ProductStatus } from 'types/enums/product';
import { ExternalStoreMappingRepository } from '../external-store-mappings/external-store-mappings.repository';
import { CategoryRepository } from '../category/category.repository';
@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly productService: ProductService,
    private readonly productRepository: ProductRepository,
    private readonly mappingRepository: ExternalStoreMappingRepository,
    private readonly categoryRepository: CategoryRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  // @Cron('* * * * *')
  @Cron('0 */8 * * *')
  async handleProductSync() {
    this.logger.log('🚀 Lancement de la synchronisation des produits...');

    try {
      const cacheKeyMappings = 'external_mappings';
      let mappings: any = await this.cacheManager.get(cacheKeyMappings);

      if (!mappings) {
        mappings = await this.mappingRepository.findAll();
        await this.cacheManager.set(cacheKeyMappings, mappings, 3600);
      }

      if (!mappings || mappings.length === 0) {
        this.logger.warn(
          '⚠️ Aucun mapping trouvé, arrêt de la synchronisation.',
        );
        return;
      }

      // Fetch all categories once
      const categories = await this.categoryRepository.getAllCategories();

      if (!categories || categories.length === 0) {
        this.logger.warn(
          '⚠️ Aucun category trouvé, arrêt de la synchronisation.',
        );
        return;
      }

      for (const mapping of mappings) {
        const { externalCompanyId, storeId } = mapping;
        this.logger.log(
          `🔄 Synchronisation des produits pour companyId=${externalCompanyId}...`,
        );

        for (const category of categories) {
          const categoryId = category.id; // string id from DB

          try {
            const cacheKeyProducts = `products_company_${externalCompanyId}_category_${categoryId}`;
            let clientProducts: any =
              await this.cacheManager.get(cacheKeyProducts);

            if (!clientProducts) {
              clientProducts =
                await this.productService.fetchProductsByCategory({
                  companyId: externalCompanyId,
                  categoryId: Number(categoryId),
                });
              await this.cacheManager.set(
                cacheKeyProducts,
                clientProducts,
                900,
              ); // 15 min cache
            }

            for (const clientProduct of clientProducts.data) {
              try {
                // Pass storeId too for composite PK lookup
                const existingProduct =
                  await this.productRepository.getProductById(clientProduct.id);

                const vatString = String(this.parseVat(clientProduct.tva));

                const productDataToUpsert = existingProduct
                  ? {
                      id: existingProduct.id,
                      storeId: existingProduct.storeId,
                      name:
                        clientProduct.name ||
                        clientProduct.title ||
                        'Unknown Product',
                      description: clientProduct.description || '',
                      category: categoryId,
                      priceHT: clientProduct.pv_ht || 0,
                      priceTTC: clientProduct.pv_ttc || 0,
                      vat: vatString,
                      quantity: clientProduct.stock || 0,
                      status: existingProduct.status,
                      owner: existingProduct.owner || 'VAPOSTORE',
                      createdAt: existingProduct.createdAt,
                      updatedAt: new Date(),
                    }
                  : {
                      id: clientProduct.id,
                      storeId,
                      name:
                        clientProduct.name ||
                        clientProduct.title ||
                        'Unknown Product',
                      description: clientProduct.description || '',
                      category: categoryId,
                      priceHT: clientProduct.pv_ht || 0,
                      priceTTC: clientProduct.pv_ttc || 0,
                      vat: vatString,
                      quantity: clientProduct.stock || 0,
                      status: ProductStatus.ACTIVATED,
                      owner: 'VAPOSTORE',
                      createdAt: new Date(),
                      updatedAt: new Date(),
                    };

                await this.productRepository.upsertProduct(productDataToUpsert);
              } catch (productError) {
                this.logger.error(
                  `❌ Error upserting product ${clientProduct.id} for companyId=${externalCompanyId}, categoryId=${categoryId}`,
                  productError.stack,
                );
              }
            }

            this.logger.log(
              `✅ Synchronisation terminée pour companyId=${externalCompanyId}, categoryId=${categoryId}`,
            );
          } catch (syncError) {
            this.logger.error(
              `❌ Erreur lors de la synchronisation pour companyId=${externalCompanyId}, categoryId=${categoryId}`,
              syncError.stack,
            );
          }
        }
      }

      this.logger.log(
        '🎯 Synchronisation des produits terminée pour tous les mappings et catégories.',
      );
    } catch (error) {
      this.logger.error(
        '💥 Erreur globale de synchronisation des produits',
        error.stack,
      );
    }
  }

  private parseVat(value: any): number {
    if (!value) return 0;
    if (typeof value === 'number') return value;

    const match = String(value).match(/\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : 0;
  }
}
