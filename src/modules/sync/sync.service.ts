import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ProductRepository } from '../product/product.repository';
import { ProductService } from '../product/product.service';
import { ProductStatus } from 'types/enums/product';
import { ExternalStoreMappingRepository } from '../external-store-mappings/external-store-mappings.repository';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly productService: ProductService,
    private readonly productRepository: ProductRepository,
    private readonly mappingRepository: ExternalStoreMappingRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @Cron('0 */4 * * *')
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

      for (const mapping of mappings) {
        const { externalCompanyId, storeId } = mapping;
        this.logger.log(
          `🔄 Synchronisation des produits pour companyId=${externalCompanyId}...`,
        );

        try {
          const cacheKeyProducts = `products_company_${externalCompanyId}_category_17`;
          let clientProducts: any =
            await this.cacheManager.get(cacheKeyProducts);

          if (!clientProducts) {
            clientProducts = await this.productService.fetchProductsByCategory({
              companyId: externalCompanyId,
              categoryId: 17,
            });
            await this.cacheManager.set(cacheKeyProducts, clientProducts, 900); // 15 min cache
          }

          for (const clientProduct of clientProducts.data) {
            const existingProduct = await this.productRepository.getProductById(
              clientProduct.id,
            );

            const productDataToUpsert = existingProduct
              ? {
                  ...existingProduct,
                  storeId,
                  category: clientProduct.category_id,
                  priceHT: clientProduct.pv_ht,
                  priceTTC: clientProduct.pv_ttc,
                  vat: this.parseVat(clientProduct.tva),
                  quantity: clientProduct.stock,
                  updatedAt: new Date(),
                }
              : {
                  ...clientProduct,
                  storeId,
                  category: clientProduct.category_id,
                  priceHT: clientProduct.pv_ht,
                  priceTTC: clientProduct.pv_ttc,
                  vat: this.parseVat(clientProduct.tva),
                  quantity: clientProduct.stock,
                  status: ProductStatus.ACTIVATED,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                };

            await this.productRepository.upsertProduct(productDataToUpsert);
          }

          this.logger.log(
            `✅ Synchronisation terminée pour companyId=${externalCompanyId}`,
          );
        } catch (syncError) {
          this.logger.error(
            `❌ Erreur lors de la synchronisation pour companyId=${externalCompanyId}`,
            syncError.stack,
          );
        }
      }

      this.logger.log(
        '🎯 Synchronisation des produits terminée pour tous les mappings.',
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
