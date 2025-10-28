import { db } from '@/database/connection';
import { Injectable } from '@nestjs/common';
import { productImages } from 'vapostore-db';

@Injectable()
export class ProductImagesRepository {
  async findByProductId(productId: string): Promise<{ url: string }[]> {
    return db.select().from(productImages).where((img, { eq }) => eq(img.productId, productId));
  }
}
