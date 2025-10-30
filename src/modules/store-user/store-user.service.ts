import { Injectable, Logger } from '@nestjs/common';
import { StoreUserRepository } from './store-user.repository';
@Injectable()
export class StoreUserService {
  private readonly logger = new Logger(StoreUserService.name);
  constructor(private readonly storeUserRepository: StoreUserRepository) {}

  async removeStoreUser(userId: string, storeId: string) {
    try {
      await this.storeUserRepository.removeUserFromStore(
        userId,
        storeId,
      );

      this.logger.log(
        `✅ Removed user ${userId} from store ${storeId}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to remove user ${userId} from store ${storeId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
