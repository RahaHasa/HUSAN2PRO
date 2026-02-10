'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-new';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { ShoppingCart, User, Heart, Menu } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getProducts().catch(() => []),
      api.getCategories().catch(() => [])
    ])
      .then(([productsData, categoriesData]) => {
        setProducts(productsData.slice(0, 12));
        setCategories(categoriesData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-lg font-medium">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-black">CINERENT</Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-sm font-medium hover:text-gray-600 transition">Главная</Link>
              <Link href="/catalog" className="text-sm font-medium hover:text-gray-600 transition">Каталог</Link>
              {user?.role === 'admin' && (
                <Link href="/admin" className="text-sm font-medium hover:text-gray-600 transition">Админ</Link>
              )}
            </nav>

            <div className="flex items-center space-x-3 sm:space-x-6">
              <button className="hover:text-gray-600 transition hidden sm:block">
                <ShoppingCart className="w-5 h-5" />
              </button>
              <button className="hover:text-gray-600 transition hidden sm:block">
                <Heart className="w-5 h-5" />
              </button>
              {user ? (
                <Link href="/profile" className="text-sm font-medium hover:text-gray-600 transition flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline">{user.firstName}</span>
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

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
                Аренда
                <br />
                кинооборудования
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 md:mb-8">
                Профессиональное оборудование для ваших проектов
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <Link
                  href="/catalog"
                  className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition"
                >
                  Посмотреть каталог
                </Link>
                <Link
                  href="/about"
                  className="bg-white text-black px-8 py-3 rounded-lg font-medium border border-gray-300 hover:border-gray-400 transition"
                >
                  О нас
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        {categories.length > 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-8">Категории</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/catalog?category=${category.id}`}
                    className="group"
                  >
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                      {category.image ? (
                        <img 
                          src={category.image} 
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl group-hover:scale-110 transition">
                          📷
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm font-medium text-center">{category.name}</h3>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Products */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Все товары</h2>
              <Link href="/catalog" className="text-sm font-medium hover:underline">
                Смотреть все →
              </Link>
            </div>
            
            {products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">Пока нет товаров</p>
                <p className="text-gray-400 mt-2">Добавьте товары в админ-панели</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="group bg-white rounded-lg overflow-hidden hover:shadow-lg transition"
                  >
                    <div className="aspect-square bg-gray-100 overflow-hidden">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>
                      )}
                    </div>
                    <div className="p-3 sm:p-4">
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
          </div>
        </section>
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
