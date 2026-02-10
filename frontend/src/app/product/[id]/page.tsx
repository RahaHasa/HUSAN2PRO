'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-new';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingCart, User, Heart, Menu, Calendar, CheckCircle, ArrowLeft } from 'lucide-react';
import Toast from '@/components/Toast';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [showPricingTiers, setShowPricingTiers] = useState(false);
  const [selectedPricingType, setSelectedPricingType] = useState<'hour' | 'day' | 'week'>('day');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    loadProduct();
  }, [params.id]);

  useEffect(() => {
    if (startDate && endDate && product) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const hours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
      const days = Math.ceil(hours / 24);
      const weeks = Math.ceil(days / 7);
      
      let price = 0;
      if (selectedPricingType === 'hour' && product.pricePerHour) {
        price = hours * product.pricePerHour;
      } else if (selectedPricingType === 'week' && product.pricePerWeek) {
        price = weeks * product.pricePerWeek;
      } else {
        const basePrice = product.pricePerDay || product.price;
        price = days * basePrice;
      }
      
      setTotalPrice(price > 0 ? price : 0);
    }
  }, [startDate, endDate, product, selectedPricingType]);

  const loadProduct = async () => {
    try {
      const data = await api.getProduct(Number(params.id));
      setProduct(data);
    } catch (error) {
      console.error('Failed to load product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingIndex = cartItems.findIndex((item: any) => item.id === product.id);
    
    if (existingIndex >= 0) {
      cartItems[existingIndex].quantity += 1;
      cartItems[existingIndex].totalPrice = totalPrice;
    } else {
      cartItems.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        totalPrice,
        startDate,
        endDate
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cartItems));
    setToast({ message: 'Товар добавлен в корзину!', type: 'success' });
  };

  const handleRentNow = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!startDate || !endDate) {
      setToast({ message: 'Пожалуйста, выберите даты аренды', type: 'error' });
      return;
    }

    try {
      await api.createRental({
        user: user.id,
        product: product.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        rentalPrice: totalPrice,
        totalPrice
      });
      setToast({ message: 'Аренда успешно оформлена!', type: 'success' });
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } catch (error) {
      console.error('Failed to create rental:', error);
      setToast({ message: 'Ошибка при оформлении аренды', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-lg font-medium">Загрузка...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Товар не найден</h1>
          <Link href="/catalog" className="text-blue-600 hover:underline">
            Вернуться в каталог
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl sm:text-2xl font-bold text-black">CINERENT</Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-sm font-medium hover:text-gray-600 transition">Главная</Link>
              <Link href="/catalog" className="text-sm font-medium hover:text-gray-600 transition">Каталог</Link>
              {user?.role === 'admin' && (
                <Link href="/admin" className="text-sm font-medium hover:text-gray-600 transition">Админ</Link>
              )}
            </nav>

            <div className="flex items-center space-x-3 sm:space-x-6">
              <Link href="/cart" className="hover:text-gray-600 transition hidden sm:block">
                <ShoppingCart className="w-5 h-5" />
              </Link>
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
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-12">
        <Link href="/catalog" className="inline-flex items-center text-sm text-gray-600 hover:text-black mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад в каталог
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Product Image */}
          <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">📦</div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium">
                  {product.category?.name || 'Без категории'}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  product.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {product.available ? '✓ Доступен' : '✗ Недоступен'}
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">{product.name}</h1>
              
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl sm:text-5xl font-bold">${product.price}</span>
                <span className="text-lg text-gray-500">/ день</span>
              </div>

              <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                {product.description || 'Описание отсутствует'}
              </p>
            </div>

            {product.specifications && (
              <div className="border-t pt-6">
                <h2 className="text-xl font-bold mb-3">Характеристики</h2>
                <p className="text-gray-600 whitespace-pre-line">{product.specifications}</p>
              </div>
            )}

            {/* Rental Form */}
            {product.available && (
              <div className="border-t pt-6 space-y-4">
                <h2 className="text-xl font-bold">Выберите период аренды</h2>
                
                {/* Flexible Pricing Toggle */}
                {(product.pricePerHour || product.pricePerWeek) && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showPricingTiers}
                        onChange={(e) => setShowPricingTiers(e.target.checked)}
                        className="mt-1 w-5 h-5 rounded border-gray-300"
                      />
                      <div>
                        <span className="font-medium text-gray-900">🔑 Гибкие тарифы</span>
                        <p className="text-sm text-gray-600 mt-1">Выберите оптимальный тариф для вашей аренды</p>
                      </div>
                    </label>
                    
                    {showPricingTiers && (
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {product.pricePerHour && (
                          <button
                            onClick={() => setSelectedPricingType('hour')}
                            className={`p-4 rounded-lg border-2 transition text-left ${
                              selectedPricingType === 'hour'
                                ? 'border-black bg-black text-white'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="text-xs font-medium opacity-75 mb-1">За час</div>
                            <div className="text-2xl font-bold">${product.pricePerHour}</div>
                          </button>
                        )}
                        
                        <button
                          onClick={() => setSelectedPricingType('day')}
                          className={`p-4 rounded-lg border-2 transition text-left ${
                            selectedPricingType === 'day'
                              ? 'border-black bg-black text-white'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="text-xs font-medium opacity-75 mb-1">За день</div>
                          <div className="text-2xl font-bold">${product.pricePerDay || product.price}</div>
                        </button>
                        
                        {product.pricePerWeek && (
                          <button
                            onClick={() => setSelectedPricingType('week')}
                            className={`p-4 rounded-lg border-2 transition text-left ${
                              selectedPricingType === 'week'
                                ? 'border-black bg-black text-white'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="text-xs font-medium opacity-75 mb-1">За неделю</div>
                            <div className="text-2xl font-bold">${product.pricePerWeek}</div>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Дата начала</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Дата окончания</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                    />
                  </div>
                </div>

                {totalPrice > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Итого:</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedPricingType === 'hour' && `${Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60))} часов`}
                      {selectedPricingType === 'day' && `${Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} дней`}
                      {selectedPricingType === 'week' && `${Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24 * 7))} недель`}
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleRentNow}
                    disabled={!startDate || !endDate}
                    className="flex-1 bg-black text-white px-6 py-4 rounded-lg font-medium hover:bg-gray-800 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Арендовать сейчас
                  </button>
                  
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-white text-black px-6 py-4 rounded-lg font-medium border-2 border-black hover:bg-gray-50 transition flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    В корзину
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="text-3xl mb-3">🚚</div>
            <h3 className="font-bold mb-2">Быстрая доставка</h3>
            <p className="text-sm text-gray-600">Доставка оборудования в течение 24 часов</p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="text-3xl mb-3">🛡️</div>
            <h3 className="font-bold mb-2">Гарантия качества</h3>
            <p className="text-sm text-gray-600">Все оборудование проверено и исправно</p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="text-3xl mb-3">💬</div>
            <h3 className="font-bold mb-2">Поддержка 24/7</h3>
            <p className="text-sm text-gray-600">Консультации и помощь в любое время</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16 md:mt-24">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">CINERENT</h3>
              <p className="text-gray-400 text-sm">Профессиональное кинооборудование в аренду</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Компания</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white transition">О нас</Link></li>
                <li><Link href="/contacts" className="hover:text-white transition">Контакты</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Каталог</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/catalog" className="hover:text-white transition">Все товары</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Поддержка</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/help" className="hover:text-white transition">Помощь</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2026 CINERENT. Все права защищены.
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
