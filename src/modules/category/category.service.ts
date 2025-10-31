import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CategoryRepository } from './category.repository';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { TCategory } from 'types/category';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(private readonly categoryRepository: CategoryRepository) {}

  async fetchAllCategories(): Promise<TCategory[]> {
    try {
      const categories = await this.categoryRepository.getAllCategories();
      return categories as TCategory[];
    } catch (e) {
      this.logger.error('Error fetching categories', e);
    }
  }

  async getCategoryById(id: string): Promise<TCategory> {
    const category = await this.categoryRepository.getCategoryById(id);

    if (!category) {
      this.logger.error('Category not found');
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async createCategory(dto: CreateCategoryDto) {
    const newCategory = await this.categoryRepository.createCategory(dto);

    return newCategory;
  }
}
