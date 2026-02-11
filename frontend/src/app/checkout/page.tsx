'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Mail, Phone, CreditCard, Check } from 'lucide-react';

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [discount, setDiscount] = useState<{code: string, percentage: number} | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    whatsapp: '',
    notificationMethod: 'email',
    paymentMethod: 'card'
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.notificationEmail || user.email,
        whatsapp: user.notificationWhatsApp || user.phone || '',
        notificationMethod: user.preferredNotification || 'email',
        paymentMethod: 'card'
      });
    }
  }, [user]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    
    // Загрузка скидки
    const savedDiscount = localStorage.getItem('cartDiscount');
    if (savedDiscount) {
      setDiscount(JSON.parse(savedDiscount));
    }
  }, []);

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.totalPrice * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    if (discount) {
      const discountAmount = (subtotal * discount.percentage) / 100;
      return subtotal - discountAmount;
    }
    return subtotal;
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    
    // Симуляция оплаты
    setTimeout(async () => {
      try {
        // Здесь будет реальный API запрос для создания заказа
        console.log('Order placed:', {
          items: cart,
          total: calculateTotal(),
          notification: formData.notificationMethod,
          contact: formData.notificationMethod === 'email' ? formData.email : formData.whatsapp
        });
        
        // Очистка корзины и скидки
        localStorage.removeItem('cart');
        localStorage.removeItem('cartDiscount');
        setCart([]);
        setOrderPlaced(true);
        
        // Перенаправление через 3 секунды
        setTimeout(() => {
          router.push('/profile');
        }, 3000);
      } catch (error) {
        console.error('Order failed:', error);
        alert('Ошибка при оформлении заказа');
      } finally {
        setLoading(false);
      }
    }, 2000);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Жүктелуде...</div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Тапсырыс рәсімделді!</h1>
          <p className="text-gray-600 mb-2">Хабарландыру жіберілді:</p>
          <p className="text-lg font-semibold text-blue-600 mb-6">
            {formData.notificationMethod === 'email' ? formData.email : formData.whatsapp}
          </p>
          <p className="text-sm text-gray-500">Профильге бағыттау...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-100">
        <header className="bg-white border-b border-blue-100 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="flex items-center">
              <img src="/logo.svg" alt="RENT MEYRAM" className="h-12 sm:h-16 md:h-20" />
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Себет бос</h2>
            <Link
              href="/catalog"
              className="inline-block bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition"
            >
              Каталогқа өту
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-100">
      <header className="bg-white border-b border-blue-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">CINERENT</Link>
            <Link href="/cart" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">
              ← Себетке қайту
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 lg:py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Тапсырысты рәсімдеу</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Форма */}
            <div className="lg:col-span-2 space-y-6">
              {/* Способ уведомления */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Байланыс әдісі</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      id="email"
                      name="notification"
                      value="email"
                      checked={formData.notificationMethod === 'email'}
                      onChange={(e) => setFormData({ ...formData, notificationMethod: e.target.value })}
                      className="mt-1"
                    />
                    <label htmlFor="email" className="flex-1">
                      <div className="flex items-center gap-2 font-medium text-gray-900 mb-2">
                        <Mail className="w-5 h-5 text-blue-600" />
                        Email
                      </div>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="your@email.com"
                        disabled={formData.notificationMethod !== 'email'}
                      />
                    </label>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      id="whatsapp"
                      name="notification"
                      value="whatsapp"
                      checked={formData.notificationMethod === 'whatsapp'}
                      onChange={(e) => setFormData({ ...formData, notificationMethod: e.target.value })}
                      className="mt-1"
                    />
                    <label htmlFor="whatsapp" className="flex-1">
                      <div className="flex items-center gap-2 font-medium text-gray-900 mb-2">
                        <Phone className="w-5 h-5 text-green-600" />
                        WhatsApp
                      </div>
                      <input
                        type="tel"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="+7 777 123 45 67"
                        disabled={formData.notificationMethod !== 'whatsapp'}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Способ оплаты */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Төлем әдісі</h2>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 border-2 border-blue-500 rounded-lg bg-blue-50">
                    <input
                      type="radio"
                      id="card"
                      name="payment"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    />
                    <label htmlFor="card" className="flex-1 flex items-center gap-2 font-medium text-gray-900 cursor-pointer">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      Карта
                    </label>
                  </div>

                  <div className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg opacity-50">
                    <input type="radio" disabled />
                    <label className="flex-1 flex items-center gap-2 font-medium text-gray-500">
                      Қолма-қол ақша (жақында)
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Итоги заказа */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Сіздің тапсырысыңыз</h2>
                
                <div className="space-y-3 mb-6">
                  {cart.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.name} x{item.quantity}
                      </span>
                      <span className="font-medium text-gray-900">
                        {(item.totalPrice * item.quantity).toFixed(2)} ₸
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center text-gray-600 mb-2">
                    <span>Аралық қорытынды:</span>
                    <span>{calculateSubtotal().toFixed(2)} ₸</span>
                  </div>
                  
                  {discount && (
                    <div className="flex justify-between items-center text-green-600 mb-2">
                      <span>Жеңілдік ({discount.code} - {discount.percentage}%):</span>
                      <span>-{((calculateSubtotal() * discount.percentage) / 100).toFixed(2)} ₸</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="text-lg font-bold text-gray-900">Барлығы:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {calculateTotal().toFixed(2)} ₸
                    </span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-cyan-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Өңделуде...' : 'Төлеу'}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Хабарландыру жіберіледі: {formData.notificationMethod === 'email' ? 'Email' : 'WhatsApp'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
