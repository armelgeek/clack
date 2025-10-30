import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HeadbandRepository } from './headband.repository';
import { CreateHeadbandDto } from './dto/create-headband.dto';
import { HeadBand } from '@/database';
import { BannerGateway } from './headband.gateway';

@Injectable()
export class HeadbandService {
  constructor(
    @Inject(forwardRef(() => BannerGateway))
    private readonly bannerGateway: BannerGateway,
    private readonly headbandRepository: HeadbandRepository,
  ) {}

  async create(title: string, description: string) {
    const newBanner = await this.headbandRepository.create({
      title,
      description,
    });
    await this.bannerGateway.broadcastBannerUpdate();
    return newBanner;
  }

  async toggleIsActive(id: string, isActive: boolean): Promise<HeadBand> {
    const updated = await this.headbandRepository.updateIsActive(id, isActive);
    if (!updated) throw new NotFoundException(`Banner with ID ${id} not found`);
    await this.bannerGateway.broadcastBannerUpdate();
    return updated;
  }

  async update(
    id: string,
    updateData: Partial<CreateHeadbandDto>,
  ): Promise<HeadBand> {
    const updated = await this.headbandRepository.update(id, updateData);
    if (!updated) throw new NotFoundException(`Banner with ID ${id} not found`);
    await this.bannerGateway.broadcastBannerUpdate();
    return updated;
  }

  async findAll() {
    return this.headbandRepository.getAll();
  }

  @Cron(CronExpression.EVERY_HOUR)
  async deactivateExpiredBanners() {
    console.log('[CRON] Checking expired banners at', new Date());
    try {
      const now = new Date();
      const banners = await this.headbandRepository.getAllActive();
      console.log('[CRON] Found active banners:', banners.length);
      for (const banner of banners) {
        const createdAt = new Date(banner.createdAt);
        const hoursDiff =
          (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        console.log(
          `[CRON] Banner ${banner.id} active for ${hoursDiff.toFixed(2)} hours`,
        );
        if (hoursDiff >= 48) {
          console.log(`[CRON] Deactivating banner ${banner.id}`);
          await this.toggleIsActive(banner.id, false);
        }
      }
    } catch (err) {
      console.error('[CRON ERROR]', err);
    }
  }
}
