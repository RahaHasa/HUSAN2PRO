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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    loadProduct();
  }, [params.id]);

  useEffect(() => {
    if (startDate && endDate && product) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      const basePrice = product.pricePerDay || product.price;
      const price = days * basePrice;
      
      setTotalPrice(price > 0 ? price : 0);
    }
  }, [startDate, endDate, product]);

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
    setToast({ message: 'Тауар себетке қосылды!', type: 'success' });
  };

  const handleRentNow = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!startDate || !endDate) {
      setToast({ message: 'Жалға алу күндерін таңдаңыз', type: 'error' });
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
      setToast({ message: 'Жалға алу сәтті рәсімделді!', type: 'success' });
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } catch (error) {
      console.error('Failed to create rental:', error);
      setToast({ message: 'Жалға алуды рәсімдеу кезінде қате', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-lg font-medium">Жүктелуде...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Тауар табылмады</h1>
          <Link href="/catalog" className="text-blue-600 hover:underline">
            Каталогқа оралу
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
            <Link href="/" className="flex items-center">
              <img src="/logo.svg" alt="RENT MEYRAM" className="h-10" />
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-sm font-medium hover:text-gray-600 transition">Басты бет</Link>
              <Link href="/catalog" className="text-sm font-medium hover:text-gray-600 transition">Каталог</Link>
              {user?.role === 'admin' && (
                <Link href="/admin" className="text-sm font-medium hover:text-gray-600 transition">Әкімші</Link>
              )}
            </nav>

            <div className="flex items-center space-x-3 sm:space-x-6">
              {user?.role !== 'admin' && (
                <Link href="/cart" className="hover:text-gray-600 transition hidden sm:block">
                  <ShoppingCart className="w-5 h-5" />
                </Link>
              )}
              <button className="hover:text-gray-600 transition hidden sm:block">
                <Heart className="w-5 h-5" />
              </button>
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

      <main className="container mx-auto px-4 py-6 md:py-12">
        <Link href="/catalog" className="inline-flex items-center text-sm text-gray-600 hover:text-black mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Каталогқа қайту
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
                  {product.category?.name || 'Санатсыз'}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  product.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {product.available ? 'Қолжетімді' : 'Қолжетімсіз'}
                </span>
                {product.stock !== undefined && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    product.stock > 5 ? 'bg-blue-100 text-blue-700' : 
                    product.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-red-100 text-red-700'
                  }`}>
                    📦 Қоймада: {product.stock} дана
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">{product.name}</h1>
              
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl sm:text-5xl font-bold">{product.price} ₸</span>
                <span className="text-lg text-gray-500">/ день</span>
              </div>

              <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                {product.description || 'Сипаттама жоқ'}
              </p>
            </div>

            {product.specifications && (
              <div className="border-t pt-6">
                <h2 className="text-xl font-bold mb-3">Сипаттамалар</h2>
                <p className="text-gray-600 whitespace-pre-line">{product.specifications}</p>
              </div>
            )}

            {/* Rental Form */}
            {user?.role === 'admin' ? (
              <div className="border-t pt-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                  <p className="text-lg font-medium text-yellow-800">Әкімшілер тауарларды жалға ала алмайды</p>
                  <p className="text-sm text-yellow-600 mt-2">Жалға алу үшін клиент ретінде кіріңіз</p>
                </div>
              </div>
            ) : product.available && (
              <div className="border-t pt-6 space-y-4">
                <h2 className="text-xl font-bold">Жалға алу мерзімін таңдаңыз</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Басталу күні</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Аяқталу күні</label>
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
                      <span>Барлығы:</span>
                      <span>{totalPrice.toFixed(2)} ₸</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} күн
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
                    Қазір жалға алу
                  </button>
                  
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-white text-black px-6 py-4 rounded-lg font-medium border-2 border-black hover:bg-gray-50 transition flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Себетке
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
            <h3 className="font-bold mb-2">Жылдам жеткізу</h3>
            <p className="text-sm text-gray-600">Жабдықты 24 сағат ішінде жеткізу</p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="text-3xl mb-3">🛡️</div>
            <h3 className="font-bold mb-2">Сапа кепілдігі</h3>
            <p className="text-sm text-gray-600">Барлық жабдықтар тексерілген және жарамды</p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="text-3xl mb-3">💬</div>
            <h3 className="font-bold mb-2">Қолдау 24/7</h3>
            <p className="text-sm text-gray-600">Кез келген уақытта кеңес және көмек</p>
          </div>
        </div>
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
