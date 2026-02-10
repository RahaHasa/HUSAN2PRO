import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  findAll() {
    return this.categoriesRepository.find();
  }

  findOne(id: number) {
    return this.categoriesRepository.findOne({ where: { id } });
  }

  create(category: Partial<Category>) {
    if (!category.slug && category.name) {
      category.slug = this.generateSlug(category.name);
    }
    const newCategory = this.categoriesRepository.create(category);
    return this.categoriesRepository.save(newCategory);
  }

  async update(id: number, category: Partial<Category>) {
    if (category.name && !category.slug) {
      category.slug = this.generateSlug(category.name);
    }
    await this.categoriesRepository.update(id, category);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.categoriesRepository.delete(id);
    return { message: 'Category deleted' };
  }
}
