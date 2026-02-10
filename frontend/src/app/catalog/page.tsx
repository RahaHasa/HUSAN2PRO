'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-new';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { ShoppingCart, User, Heart, Menu, Search, Filter } from 'lucide-react';

export default function CatalogPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    Promise.all([
      api.getProducts().catch(() => []),
      api.getCategories().catch(() => [])
    ])
      .then(([productsData, categoriesData]) => {
        setProducts(productsData);
        setCategories(categoriesData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category?.id === parseInt(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-black">CINERENT</Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-sm font-medium hover:text-gray-600 transition">Главная</Link>
              <Link href="/catalog" className="text-sm font-medium text-black">Каталог</Link>
              {user?.role === 'admin' && (
                <Link href="/admin" className="text-sm font-medium hover:text-gray-600 transition">Админ</Link>
              )}
            </nav>

            <div className="flex items-center space-x-6">
              <button className="hover:text-gray-600 transition">
                <ShoppingCart className="w-5 h-5" />
              </button>
              <button className="hover:text-gray-600 transition">
                <Heart className="w-5 h-5" />
              </button>
              {user ? (
                <Link href="/profile" className="text-sm font-medium hover:text-gray-600 transition flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {user.firstName}
                </Link>
              ) : (
                <Link href="/login" className="text-sm font-medium hover:text-gray-600 transition">Войти</Link>
              )}
              <button className="md:hidden">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Page Title */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Каталог оборудования</h1>
          <p className="text-sm sm:text-base text-gray-600">{filteredProducts.length} товаров</p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Поиск по названию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                  selectedCategory === 'all'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Все категории
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id.toString())}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                    selectedCategory === category.id.toString()
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-lg font-medium">Загрузка...</div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Товары не найдены</p>
            <p className="text-gray-400 mt-2">Попробуйте изменить параметры поиска</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition"
              >
                <div className="aspect-square bg-gray-100 overflow-hidden relative">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>
                  )}
                  {!product.available && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Недоступен
                    </div>
                  )}
                </div>
                <div className="p-3 sm:p-4">
                  <p className="text-xs text-gray-500 mb-1">{product.category?.name || 'Без категории'}</p>
                  <h3 className="font-medium mb-2 line-clamp-2 text-sm sm:text-base">{product.name}</h3>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <span className="text-base sm:text-lg font-bold">${product.price}/день</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {product.available ? 'Доступен' : 'Недоступен'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">CINERENT</h3>
              <p className="text-gray-400 text-sm">
                Профессиональная аренда кинооборудования для вашего творчества
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Каталог</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/catalog" className="hover:text-white transition">Все товары</Link></li>
                <li><Link href="/catalog?category=cameras" className="hover:text-white transition">Камеры</Link></li>
                <li><Link href="/catalog?category=lenses" className="hover:text-white transition">Объективы</Link></li>
                <li><Link href="/catalog?category=light" className="hover:text-white transition">Свет</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Компания</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white transition">О нас</Link></li>
                <li><Link href="/contacts" className="hover:text-white transition">Контакты</Link></li>
                <li><Link href="/faq" className="hover:text-white transition">FAQ</Link></li>
                <li><Link href="/terms" className="hover:text-white transition">Условия</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Контакты</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Email: info@cinerent.com</li>
                <li>Тел: +7 777 123 45 67</li>
                <li>Адрес: г. Алматы</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 CINERENT. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
