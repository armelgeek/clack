import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { generateBasicAuthToken } from 'utils/auth';
import { StoreRepository } from '../store/store.repository';
import { ExternalStoreMappingRepository } from '../external-store-mappings/external-store-mappings.repository';
import { randomUUID } from 'crypto';

@Injectable()
export class SyncStoreService {
  private readonly logger = new Logger(SyncStoreService.name);
  private readonly nextoreApiUrl: string;
  private readonly basicAuthToken: string;

  constructor(
    private readonly storeRepository: StoreRepository,
    private readonly mappingRepository: ExternalStoreMappingRepository,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    const nextoreApi = this.configService.get('nextoreApi');
    if (nextoreApi?.username && nextoreApi?.password && nextoreApi?.url) {
      const username = nextoreApi.username;
      const password = nextoreApi.password;
      this.nextoreApiUrl = nextoreApi.url;
      this.basicAuthToken = generateBasicAuthToken(username, password);
    } else {
      this.logger.error('❌ Missing Nextore API configuration (url, username, password)');
    }
  }

  //@Cron('0 2 * * *') 
  @Cron('* * * * *')
  async handleStoreSync() {
    this.logger.log('🚀 Starting synchronization of external stores from Nextore...');

    try {
      const externalStores = await this.fetchExternalStores();
      if (!externalStores || Object.keys(externalStores).length === 0) {
        this.logger.warn('⚠️ No stores returned from Nextore API. Aborting sync.');
        return;
      }

      const cacheKeyMappings = 'external_store_mappings';
      const cachedMappings = await this.cacheManager.get<any[]>(cacheKeyMappings);
      let mappings: any[];

      if (!cachedMappings) {
        mappings = await this.mappingRepository.findAll();
        await this.cacheManager.set(cacheKeyMappings, mappings, 3600);
        this.logger.log(`🧠 Cached ${mappings.length} mappings from DB`);
      } else {
        mappings = cachedMappings;
      }

      for (const [externalId, storeName] of Object.entries(externalStores)) {
        try {
          const existingMapping = mappings.find((m) => m.externalCompanyId === Number(externalId));
          let storeId = existingMapping?.storeId;

          if (!storeId) {
            // Create new store since no mapping exists
            const newStore = await this.storeRepository.create({
              id: randomUUID(), // Generate new UUID
              name: storeName as string,
              address: '', // Required field
              status: 'ACTIVATED',
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            
            // Create mapping for future syncs
            await this.mappingRepository.create({
              externalCompanyId: Number(externalId),
              storeId: newStore.id,
            });
            
            this.logger.log(`✅ Created store "${storeName}" with mapping [externalId=${externalId}]`);
            continue;
          }

          const existingStore = await this.storeRepository.findById(storeId);

          if (!existingStore) {
            await this.storeRepository.create({
              id: String(storeId),
              name: storeName,
              address: '', // required by NewStore type; unknown from Nextore so set empty
              status: 'ACTIVE',
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            this.logger.log(` Created store "${storeName}" [externalId=${externalId}]`);
          } 
          else {
            this.logger.log(`No changes detected for "${storeName}" [externalId=${externalId}]`);
          }
        } catch (storeError) {
          this.logger.error(
            `❌ Error syncing store externalId=${externalId}`,
            storeError.stack,
          );
        }
      }

      this.logger.log('Store synchronization completed successfully.');
    } catch (error) {
      this.logger.error(' Fatal error during store synchronization', error.stack);
    }
  }

  private async fetchExternalStores(): Promise<Record<string, string>> {
    try {
      const url = `${this.nextoreApiUrl}/store/get`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Basic ${this.basicAuthToken}`,
          },
        }),
      );

      if (response.data?.status === 200 && response.data?.data) {
        this.logger.log(`📦 Fetched ${Object.keys(response.data.data).length} stores from Nextore.`);
        return response.data.data;
      }

      this.logger.warn(`⚠️ Unexpected response from Nextore: ${JSON.stringify(response.data)}`);
      return {};
    } catch (error) {
      this.logger.error('❌ Failed to fetch external stores from Nextore', error.stack);
      return {};
    }
  }
}
