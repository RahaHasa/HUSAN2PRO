'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, User, Heart, Menu, Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import Toast from '@/components/Toast';
import { api } from '@/lib/api-new';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  startDate?: string;
  endDate?: string;
}

export default function CartPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    loadCart();
    // Загрузка сохраненной скидки
    const savedDiscount = localStorage.getItem('cartDiscount');
    if (savedDiscount) {
      const discountData = JSON.parse(savedDiscount);
      setDiscount(discountData.percentage);
      setPromoCode(discountData.code);
    }
  }, []);

  const loadCart = () => {
    const items = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(items);
  };

  const updateQuantity = (id: number, change: number) => {
    const updatedCart = cartItems.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeItem = (id: number) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      setToast({ message: 'Промокодты енгізіңіз', type: 'error' });
      return;
    }

    try {
      const discount = await api.getDiscountByCode(promoCode.toUpperCase());
      
      if (!discount) {
        setToast({ message: 'Қате промокод', type: 'error' });
        setDiscount(0);
        localStorage.removeItem('cartDiscount');
        return;
      }

      // Проверка срока действия
      const now = new Date();
      if (discount.startDate && new Date(discount.startDate) > now) {
        setToast({ message: 'Промокод әлі белсенді емес', type: 'error' });
        return;
      }
      if (discount.endDate && new Date(discount.endDate) < now) {
        setToast({ message: 'Промокод мерзімі өтті', type: 'error' });
        return;
      }

      setDiscount(discount.value);
      localStorage.setItem('cartDiscount', JSON.stringify({ 
        code: discount.name, 
        percentage: discount.value 
      }));
      setToast({ message: `Промокод қолданылды! Жеңілдік ${discount.value}%`, type: 'success' });
    } catch (error) {
      console.error('Failed to apply promo code:', error);
      setToast({ message: 'Промокодты тексеру кезінде қате', type: 'error' });
      setDiscount(0);
      localStorage.removeItem('cartDiscount');
    }
  };

  const calculateDays = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      const days = calculateDays(item.startDate, item.endDate);
      return sum + (item.price * item.quantity * days);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  const handleCheckout = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-blue-100 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <Link href="/" className="flex items-center">
              <img src="/logo.svg" alt="RENT MEYRAM" className="h-12 sm:h-16 md:h-20" />
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-sm font-medium hover:text-gray-600 transition">Басты бет</Link>
              <Link href="/catalog" className="text-sm font-medium hover:text-gray-600 transition">Каталог</Link>
              {user && user.role !== 'admin' && (
                <Link href="/rentals" className="text-sm font-medium hover:text-gray-600 transition">Менің жалға алуым</Link>
              )}
              {user?.role === 'admin' && (
                <Link href="/admin" className="text-sm font-medium hover:text-gray-600 transition">Әкімші</Link>
              )}
            </nav>

            <div className="flex items-center space-x-3 sm:space-x-6">
              {user?.role !== 'admin' && (
                <>
                  <Link href="/cart" className="text-black">
                    <ShoppingCart className="w-5 h-5" />
                  </Link>
                  <Link href="/favorites" className="hover:text-gray-600 transition hidden sm:block">
                    <Heart className="w-5 h-5" />
                  </Link>
                </>
              )}
              {user ? (
                <Link href="/profile" className="text-sm font-medium hover:text-gray-600 transition flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline">{user.firstName}</span>
                </Link>
              ) : (
                <Link href="/login" className="text-sm font-medium hover:text-gray-600 transition">Кіру</Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        <Link href="/catalog" className="inline-flex items-center text-sm text-gray-600 hover:text-black mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Сатып алуды жалғастыру
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold mb-8">Себет</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Себет бос</h2>
            <p className="text-gray-600 mb-6">Каталогтан тауарларды қосыңыз</p>
            <Link href="/catalog" className="inline-block bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition">
              Каталогқа өту
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-32 h-32 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200"></div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">{item.name}</h3>
                    <p className="text-gray-600 mb-3">
                      {item.price} ₸ / день × {calculateDays(item.startDate, item.endDate)} дней
                    </p>
                    
                    {item.startDate && item.endDate && (
                      <p className="text-sm text-gray-500 mb-3">
                        📅 {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 bg-white rounded-lg border px-3 py-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="text-gray-600 hover:text-black"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-medium min-w-[2ch] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="text-gray-600 hover:text-black"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-800 p-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right sm:text-left sm:ml-auto">
                    <p className="text-xl sm:text-2xl font-bold">
                      {(item.price * item.quantity * calculateDays(item.startDate, item.endDate)).toFixed(2)} ₸
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-xl p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-6">Барлығы</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Аралық сома:</span>
                    <span>{subtotal.toFixed(2)} ₸</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Жеңілдік ({discount}%):</span>
                      <span>-{discountAmount.toFixed(2)} ₸</span>
                    </div>
                  )}

                  <div className="border-t pt-4 flex justify-between text-xl font-bold">
                    <span>Барлығы:</span>
                    <span>{total.toFixed(2)} ₸</span>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Промокод</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="Промокодты енгізіңіз"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                    />
                    <button
                      onClick={applyPromoCode}
                      className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
                    >
                      Қолдану
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Жеңілдік алу үшін промокодты енгізіңіз</p>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-black text-white py-4 rounded-lg font-medium hover:bg-gray-800 transition"
                >
                  Тапсырыс беру
                </button>

                <div className="mt-6 space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Қауіпсіз төлем</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Қайтару кепілдігі</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Қолдау 24/7</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-900 to-blue-800 text-white mt-16 md:mt-24">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">RENT MEYRAM</h3>
              <p className="text-blue-200 text-sm">Кәсіби кино жабдықтарын жалға беру</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Компания</h4>
              <ul className="space-y-2 text-sm text-blue-200">
                <li><Link href="/about" className="hover:text-white transition">Біз туралы</Link></li>
                <li><Link href="/contacts" className="hover:text-white transition">Байланыс</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Каталог</h4>
              <ul className="space-y-2 text-sm text-blue-200">
                <li><Link href="/catalog" className="hover:text-white transition">Барлық тауарлар</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Қолдау</h4>
              <ul className="space-y-2 text-sm text-blue-200">
                <li><Link href="/help" className="hover:text-white transition">Көмек</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-700 mt-8 pt-8 text-center text-sm text-blue-200">
            © 2026 RENT MEYRAM. Барлық құқықтар қорғалған.
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
