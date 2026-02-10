import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  private generateSlug(name: string): string {
    // Транслитерация кириллицы
    const cyrillicMap: Record<string, string> = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
      'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
      'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
      'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
      'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
    };
    
    let slug = name
      .toLowerCase()
      .split('')
      .map(char => cyrillicMap[char] || char)
      .join('')
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Если slug пустой, используем timestamp
    if (!slug) {
      slug = 'product-' + Date.now();
    }
    
    return slug;
  }

  async findAll() {
    const products = await this.productsRepository.find({ relations: ['category'] });
    return products.map(product => ({
      ...product,
      price: product.pricePerDay || 0,
      image: product.mainImage || '',
      available: product.status === 'available'
    }));
  }

  async findOne(id: number) {
    const product = await this.productsRepository.findOne({ where: { id }, relations: ['category'] });
    if (!product) return null;
    return {
      ...product,
      price: product.pricePerDay || 0,
      image: product.mainImage || '',
      available: product.status === 'available'
    };
  }

  async create(product: Partial<Product>) {
    // Generate slug if not provided
    if (!product.slug && product.name) {
      product.slug = this.generateSlug(product.name);
    }
    // Map price to pricePerDay if provided
    const productData: any = { ...product };
    if (productData.price && !productData.pricePerDay) {
      productData.pricePerDay = productData.price;
    }
    // Remove price field as it doesn't exist in entity
    delete productData.price;
    
    // Map image to mainImage if provided
    if (productData.image && !productData.mainImage) {
      productData.mainImage = productData.image;
    }
    delete productData.image;
    
    const newProduct = this.productsRepository.create(productData);
    return this.productsRepository.save(newProduct);
  }

  async update(id: number, product: Partial<Product>) {
    // Get existing product
    const existingProduct = await this.productsRepository.findOne({ where: { id } });
    if (!existingProduct) {
      throw new Error('Product not found');
    }
    
    // Generate slug if name changed but slug not provided
    if (product.name && !product.slug) {
      product.slug = this.generateSlug(product.name);
    }
    
    // Map price to pricePerDay if provided
    const productData: any = { ...product };
    if (productData.price && !productData.pricePerDay) {
      productData.pricePerDay = productData.price;
    }
    delete productData.price;
    
    // Map image to mainImage if provided
    if (productData.image && !productData.mainImage) {
      productData.mainImage = productData.image;
    }
    delete productData.image;
    
    // Handle category relation
    if (productData.categoryId) {
      existingProduct.category = { id: productData.categoryId } as any;
      delete productData.categoryId;
    }
    
    // Update existing product with new data
    Object.assign(existingProduct, productData);
    
    // Save and return
    await this.productsRepository.save(existingProduct);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.productsRepository.delete(id);
    return { message: 'Product deleted' };
  }
}
