import { db } from '@/database/connection';
import { Injectable } from '@nestjs/common';
import { and, eq, ilike, or, sql, isNull, lte, desc, count } from 'drizzle-orm';
import { productImages, products, stockMovements } from '@/database';
import {
  CreateProductDto,
  CreateProductImageData,
} from './dtos/create-product.dto';
import { v4 as uuidv4 } from 'uuid';
import { FetchProductsByStoreDto } from './dtos/fetch-products-by-store-id.dto';
import { ProductOwner, ProductStatus } from 'types/enums/product';
import { UpdateProductDto } from './dtos/update-product.dto';
import { CreateStockMovementDto } from './dtos/create-stock-movement.dto';

export interface UpdateProductImagesData {
  imagesToKeepUrls: string[];
  newImagesData: CreateProductImageData[];
}

@Injectable()
export class ProductRepository {
  async findById(id: string) {
    const result = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: {
        store: true,
      },
    });
    return result;
  }

  async findByIdAndStore(productId: string, storeId: string) {
    const result = await db.query.products.findFirst({
      where: and(eq(products.id, productId), eq(products.storeId, storeId)),
      with: {
        store: true,
        images: true,
      },
    });
    return result;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    _category?: string,
  ) {
    const offset = (page - 1) * limit;

    const conditions = [];

    conditions.push(isNull(products.deletedAt));
    conditions.push(eq(products.status, 'ACTIVATED'));

    if (search) {
      conditions.push(
        or(
          ilike(products.name, `%${search}%`),
          ilike(products.category, `%${search}%`),
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(whereClause);

    const total = Number(countResult[0]?.count || 0);

    const results = await db.query.products.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: (products, { desc }) => [desc(products.createdAt)],
      with: {
        store: true,
      },
    });

    return {
      data: results,
      total,
    };
  }

  async findByStoreId(
    storeId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    _category?: string,
  ) {
    const offset = (page - 1) * limit;

    const conditions = [eq(products.storeId, storeId)];

    conditions.push(isNull(products.deletedAt));
    conditions.push(eq(products.status, 'ACTIVATED'));
    if (search) {
      conditions.push(
        or(
          ilike(products.name, `%${search}%`),
          ilike(products.category, `%${search}%`),
        ),
      );
    }

    const whereClause = and(...conditions);

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(whereClause);

    const total = Number(countResult[0]?.count || 0);

    // Get paginated results
    const results = await db.query.products.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: (products, { desc }) => [desc(products.createdAt)],
      with: {
        store: true,
      },
    });

    return {
      data: results,
      total,
    };
  }

  async findSimilar(productId: string, category: string, limit: number = 4) {
    const conditions = and(
      eq(products.category, category),
      eq(products.status, 'ACTIVATED'),
      isNull(products.deletedAt),
      sql`${products.id} != ${productId}`,
    );

    const results = await db.query.products.findMany({
      where: conditions,
      limit,
      orderBy: sql`random()`,
      with: {
        store: true,
      },
    });

    return results;
  }

  // Methods from superadmin for sync functionality
  async getProductById(id: string) {
    // Use a direct expression to avoid callback-based operator typing issues
    return await db.query.products.findFirst({
      where: eq(products.id, id),
    });
  }

  async upsertProduct(productData: any) {
    return await db
      .insert(products)
      .values(productData)
      .onConflictDoUpdate({
        target: [products.id, products.storeId],
        set: productData,
      })
      .execute();
  }

  async countProductsByStoreId(storeId: string) {
    const result = await db
      .select({
        count: sql<number>`cast(count(${products.id}) as int)`,
      })
      .from(products)
      .where(eq(products.storeId, storeId));

    return result[0]?.count ?? 0;
  }

  async countAllProducts() {
    const result = await db
      .select({
        count: sql<number>`cast(count(${products.id}) as int)`,
      })
      .from(products);

    return result[0]?.count ?? 0;
  }

  // Methods for store admin
  async getProductDetailsById(id: string) {
    return await db.query.products.findFirst({
      where: (product, { eq }) => eq(product.id, id),
      with: {
        images: {},
        category: {},
      },
    });
  }

  async getOtherProductByName(productName: string) {
    const result = await db
      .select()
      .from(products)
      .where(
        and(eq(products.owner, 'OTHER'), ilike(products.name, productName)),
      )
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  async fetchFilteredProductsByStoreId(
    storeId: string,
    params: FetchProductsByStoreDto,
  ) {
    const offset = (params.page - 1) * params.limit;
    const conditions = [eq(products.storeId, storeId)];

    if (params.owner) {
      conditions.push(eq(products.owner, params.owner));
    }

    if (params.status) {
      conditions.push(eq(products.status, params.status));
    }

    if (params.categoryId) {
      conditions.push(eq(products.category, params.categoryId));
    }

    if (params.threshold) {
      conditions.push(lte(products.quantity, params.threshold));
    }

    if (params.search) {
      conditions.push(or(ilike(products.name, `%${params.search}%`)));
    }

    const finalCondition = and(...conditions);

    const result = await db.query.products.findMany({
      where: finalCondition,
      limit: params.limit,
      offset: offset,
      orderBy: [desc(products.createdAt)],
      with: {
        images: {},
        category: {},
      },
    });

    return result;
  }

  async countFilteredProductsByStoreId(
    storeId: string,
    params: Omit<FetchProductsByStoreDto, 'limit' | 'page'>,
  ): Promise<number> {
    const conditions = [eq(products.storeId, storeId)];

    if (params.owner) {
      conditions.push(eq(products.owner, params.owner));
    }

    if (params.status) {
      conditions.push(eq(products.status, params.status));
    }

    if (params.categoryId) {
      conditions.push(eq(products.category, params.categoryId));
    }

    if (params.threshold) {
      conditions.push(lte(products.quantity, params.threshold));
    }

    if (params.search) {
      conditions.push(or(ilike(products.name, `%${params.search}%`)));
    }

    const finalCondition = and(...conditions);

    const result = await db
      .select({ count: count() })
      .from(products)
      .where(finalCondition)
      .execute();

    return result[0].count;
  }

  // TODO: Create a new product which is not owned by Vapostore
  async createProductWithImages(
    productData: CreateProductDto & {
      id: string;
      vat: string;
      priceHT: number;
    },
    imageDatas: CreateProductImageData[],
  ) {
    return db.transaction(async (tx) => {
      const [newProduct] = await tx
        .insert(products)
        .values({
          ...productData,
          owner: ProductOwner.OTHER,
        })
        .returning();

      if (!newProduct) {
        throw new Error('Failed to insert product');
      }

      const productImagesToInsert = imageDatas.map((img, index) => ({
        id: uuidv4(),
        productId: newProduct.id,
        storeId: newProduct.storeId,
        url: img.url,
        filename: img.filename,
        objectKey: img.objectKey,
      }));

      if (productImagesToInsert.length > 0) {
        await tx.insert(productImages).values(productImagesToInsert);
      }

      return { ...newProduct, images: productImagesToInsert };
    });
  }

  async updateProductImage(
    productId: string,
    storeId: string,
    imagesData: CreateProductImageData[],
  ) {
    const productImagesToInsert = imagesData.map((img) => ({
      id: uuidv4(),
      productId: productId,
      storeId: storeId,
      url: img.url,
      filename: img.filename,
      objectKey: img.objectKey,
    }));

    if (productImagesToInsert.length > 0) {
      await db.insert(productImages).values(productImagesToInsert).execute();
    }
  }

  async deleteProduct(productId: string) {
    const deletedProducts = await db
      .delete(products)
      .where(eq(products.id, productId))
      .returning();

    return deletedProducts[0];
  }

  async updateProduct(
    productId: string,
    productData: Omit<UpdateProductDto, 'images'>,
    imageUpdateData: UpdateProductImagesData,
  ) {
    return db.transaction(async (tx) => {
      const [updatedProduct] = await tx
        .update(products)
        .set(productData)
        .where(eq(products.id, productId))
        .returning();

      if (!updatedProduct) {
        throw new Error(`Product with ID ${productId} not found.`);
      }

      // Récupérer toutes les images actuelles du produit pour déterminer celles à supprimer
      const currentImages = await tx.query.productImages.findMany({
        where: (image, { eq }) => eq(image.productId, productId),
      });

      const currentImageUrls = currentImages.map((img) => img.url);

      // Déterminer les URLs des images à supprimer
      const urlsToDelete = currentImageUrls.filter(
        (url) => !imageUpdateData.imagesToKeepUrls.includes(url),
      );

      // Supprimer les images qui ne sont plus dans le formulaire
      if (urlsToDelete.length > 0) {
        await tx
          .delete(productImages)
          .where(sql`${productImages.url} IN ${urlsToDelete}`)
          .execute();
      }

      // Insérer les nouvelles images
      const newImagesToInsert = imageUpdateData.newImagesData.map((img) => ({
        id: uuidv4(),
        productId: productId,
        storeId: updatedProduct.storeId,
        url: img.url,
        filename: img.filename,
        objectKey: img.objectKey,
      }));

      if (newImagesToInsert.length > 0) {
        await tx.insert(productImages).values(newImagesToInsert).execute();
      }

      const finalImages = [
        ...currentImages.filter((img) =>
          imageUpdateData.imagesToKeepUrls.includes(img.url),
        ),
        ...newImagesToInsert,
      ];

      return { ...updatedProduct, images: finalImages };
    });
  }

  async updateProductStatus(productId: string, status: ProductStatus) {
    const updatedProducts = await db
      .update(products)
      .set({
        status,
      })
      .where(eq(products.id, productId))
      .returning();
    return updatedProducts[0];
  }

  // Stock movement
  async createStockMovement(stockMovementData: CreateStockMovementDto) {
    const result = await db
      .insert(stockMovements)
      .values({
        ...stockMovementData,
        id: uuidv4(),
      })
      .returning();

    return result[0];
  }

  // Get all stock movement for a product
  async getStockMovementsByProductId(productId: string) {
    const movements = await db
      .select()
      .from(stockMovements)
      .where(eq(stockMovements.productId, productId))
      .orderBy(desc(stockMovements.createdAt))
      .execute();
    return movements;
  }

  // Get available stock for other products
  async getAvailableStock(productId: string): Promise<number> {
    // Si 'type' est 'IN', on ajoute la quantité (1 * quantity).
    // Si 'type' est 'OUT', on soustrait la quantité (-1 * quantity).
    const stockCalculation = sql<number>`
      sum(
        CASE
          WHEN ${stockMovements.type} = 'IN' THEN ${stockMovements.quantity}
          WHEN ${stockMovements.type} = 'OUT' THEN -1 * ${stockMovements.quantity}
          ELSE 0
        END
      )
    `.as('available_stock');

    const result = await db
      .select({
        availableStock: stockCalculation,
      })
      .from(stockMovements)
      .where(eq(stockMovements.productId, productId))
      .execute();

    // Si aucun mouvement n'existe, le stock est 0
    if (result.length === 0 || result[0].availableStock === null) {
      return 0;
    }

    return parseFloat(result[0].availableStock.toString());
  }
}
