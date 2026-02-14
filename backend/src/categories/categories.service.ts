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
    // Қазақ әріптерін транслитерация
    const translitMap: { [key: string]: string } = {
      'ә': 'a', 'і': 'i', 'ң': 'n', 'ғ': 'g', 'ү': 'u', 'ұ': 'u', 'қ': 'k', 'ө': 'o', 'һ': 'h',
      'Ә': 'a', 'І': 'i', 'Ң': 'n', 'Ғ': 'g', 'Ү': 'u', 'Ұ': 'u', 'Қ': 'k', 'Ө': 'o', 'Һ': 'h',
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ж': 'zh', 'з': 'z',
      'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p',
      'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch',
      'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
      'А': 'a', 'Б': 'b', 'В': 'v', 'Г': 'g', 'Д': 'd', 'Е': 'e', 'Ж': 'zh', 'З': 'z',
      'И': 'i', 'Й': 'y', 'К': 'k', 'Л': 'l', 'М': 'm', 'Н': 'n', 'О': 'o', 'П': 'p',
      'Р': 'r', 'С': 's', 'Т': 't', 'У': 'u', 'Ф': 'f', 'Х': 'h', 'Ц': 'ts', 'Ч': 'ch',
      'Ш': 'sh', 'Щ': 'sch', 'Ъ': '', 'Ы': 'y', 'Ь': '', 'Э': 'e', 'Ю': 'yu', 'Я': 'ya'
    };

    let slug = name.toLowerCase();
    
    // Қазақ және орыс әріптерін транслитерация
    for (const [char, replacement] of Object.entries(translitMap)) {
      slug = slug.replace(new RegExp(char, 'g'), replacement);
    }
    
    return slug
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'category'; // Егер бос болса, 'category' қайтару
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
