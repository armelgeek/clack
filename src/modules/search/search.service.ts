import { Injectable, Logger } from '@nestjs/common';
import { ProductRepository } from '../product/product.repository';
import { db } from '@/database/connection';
import { products, stores } from '@/database';
import { ilike, or, isNull, eq } from 'drizzle-orm';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private readonly productRepository: ProductRepository) {}

  async globalSearch(query: string, page: number = 1, limit: number = 10) {
    
    const searchQuery = Array.isArray(query) ? query[0] : query;
    
    if (!searchQuery || typeof searchQuery !== 'string') {
      return {
        products: [],
        stores: [],
        query: searchQuery,
        page,
        limit,
      };
    }
    
    const offset = (page - 1) * limit;

    // Search products
    const productResults = await db.query.products.findMany({
      where: or(
        ilike(products.name, `%${searchQuery}%`),
        ilike(products.description, `%${searchQuery}%`),
        ilike(products.category, `%${searchQuery}%`),
      ),
      with: {
        store: true,
        images: true,
      },
      limit: limit,
      offset: offset,
    });

    // Search stores
    const storeResults = await db.query.stores.findMany({
      where: or(
        ilike(stores.name, `%${searchQuery}%`),
        ilike(stores.address, `%${searchQuery}%`),
      ),
      limit: limit,
    });

    return {
      products: productResults,
      stores: storeResults,
      query: searchQuery,
      page,
      limit,
    };
  }

  async getSearchSuggestions(query: string, limit: number = 5) {

    const searchQuery = Array.isArray(query) ? query[0] : query;
    
    if (!searchQuery || typeof searchQuery !== 'string' || searchQuery.length < 2) {
      return {
        suggestions: [],
      };
    }

    // Get product name suggestions
    const productSuggestions = await db.query.products.findMany({
      where: ilike(products.name, `%${searchQuery}%`),
      columns: {
        id: true,
        name: true,
      },
      limit: limit,
    });

    // Get store name suggestions
    const storeSuggestions = await db.query.stores.findMany({
      where: ilike(stores.name, `%${searchQuery}%`),
      columns: {
        id: true,
        name: true,
      },
      limit: limit,
    });

    return {
      suggestions: [
        ...productSuggestions.map(p => ({
          id: p.id,
          name: p.name,
          type: 'product',
        })),
        ...storeSuggestions.map(s => ({
          id: s.id,
          name: s.name,
          type: 'store',
        })),
      ],
    };
  }
}
