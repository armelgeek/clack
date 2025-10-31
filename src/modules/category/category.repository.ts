import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { categories, db } from '@/database';

@Injectable()
export class CategoryRepository {
  async getCategoryById(id: string) {
    return await db.query.categories.findFirst({
      where: (category, { eq }) => eq(category.id, id),
    });
  }

  async getAllCategories() {
    const result = await db.query.categories.findMany();
    return result;
  }

  async createCategory(categoryData: CreateCategoryDto) {
    return db.transaction(async (tx) => {
      const [newCategory] = await tx
        .insert(categories)
        .values(categoryData)
        .returning();

      if (!newCategory) {
        throw new Error('Failed to insert category');
      }

      return newCategory;
    });
  }
}
