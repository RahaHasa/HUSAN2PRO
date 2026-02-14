'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-new';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { ShoppingCart, User, Heart, Menu, ShoppingBag } from 'lucide-react';
import { getFavorites, addToFavorites, removeFromFavorites, isFavorite } from '@/lib/favorites';

interface Toast {
  message: string;
  type: 'success' | 'error';
}


export default function Home() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);

  const loadFavorites = () => {
    const favs = getFavorites();
    setFavorites(favs.map(f => f.id));
  };

  useEffect(() => {
    loadFavorites();
    
    const handleFavoritesChange = () => loadFavorites();
    window.addEventListener('favoritesChanged', handleFavoritesChange);
    
    return () => window.removeEventListener('favoritesChanged', handleFavoritesChange);
  }, []);

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

  const handleToggleFavorite = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
      setToast({ message: 'Таңдаулылардан жойылды', type: 'success' });
    } else {
      addToFavorites({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || '📦'
      });
      setToast({ message: 'Таңдаулыларға қосылды', type: 'success' });
    }
    
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item: any) => item.id === product.id);
    
    if (existingItem) {
      setToast({ message: 'Тауар себетте бар', type: 'error' });
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || '',
        days: 1
      });
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartChanged'));
      setToast({ message: 'Себетке қосылды', type: 'success' });
    }
    
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-lg font-medium">Жүктелуде...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-blue-100 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
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
                  <Link href="/cart" className="hover:text-gray-600 transition hidden sm:block">
                    <ShoppingCart className="w-5 h-5" />
                  </Link>
                  <Link href="/favorites" className="hover:text-gray-600 transition hidden sm:block">
                    <Heart className={`w-5 h-5 ${favorites.length > 0 ? 'fill-red-500 text-red-500' : ''}`} />
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
              <button className="md:hidden">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 py-16 md:py-24 lg:py-32 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 text-6xl">📹</div>
            <div className="absolute top-20 right-20 text-5xl">🎥</div>
            <div className="absolute bottom-20 left-1/4 text-7xl">📷</div>
            <div className="absolute top-1/3 right-1/3 text-4xl">🎬</div>
            <div className="absolute bottom-10 right-10 text-6xl">🎞️</div>
            <div className="absolute top-40 left-1/2 text-5xl">🎙️</div>
          </div>
          <div className="container mx-auto px-4">
            <div className="max-w-3xl relative z-10">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight text-white drop-shadow-lg">
                Киножабдықтарды
                <br />
                жалға алу
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 md:mb-8">
                Жобаларыңызға кәсіби жабдықтар
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <Link
                  href="/catalog"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition shadow-lg"
                >
                  Каталогты көру
                </Link>
                <Link
                  href="/about"
                  className="bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-lg font-medium border-2 border-white/40 hover:bg-white/30 transition"
                >
                  Біз туралы
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        {categories.length > 0 && (
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-8">Санаттар</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
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
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
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
        <section className="py-16 bg-gradient-to-br from-blue-50 to-cyan-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Барлық тауарлар</h2>
              <Link href="/catalog" className="text-sm font-medium hover:underline">
                Бәрін көру →
              </Link>
            </div>
            
            {products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">Әзірше тауарлар жоқ</p>
                <p className="text-gray-400 mt-2">Әкімші панелінде тауарларды қосыңыз</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                {products.map((product) => (
                  <div key={product.id} className="group bg-white rounded-lg overflow-hidden hover:shadow-lg transition">
                    <Link href={`/product/${product.id}`} className="block">
                      <div className="aspect-square bg-gray-100 overflow-hidden relative">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200"></div>
                        )}
                        <button
                          onClick={(e) => handleToggleFavorite(e, product)}
                          className="absolute top-2 left-2 z-10 bg-white rounded-full p-2 shadow-md hover:scale-110 transition"
                        >
                          <Heart className={`w-4 h-4 ${isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                        </button>
                      </div>
                      <div className="p-3 sm:p-4">
                        <h3 className="font-medium mb-2 line-clamp-2 text-sm sm:text-base">{product.name}</h3>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <span className="text-base sm:text-lg font-bold">{product.price} ₸/день</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            product.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {product.available ? 'Қолжетімді' : 'Қолжетімсіз'}
                          </span>
                        </div>
                      </div>
                    </Link>
                    {user?.role !== 'admin' && product.available && (
                      <div className="px-3 pb-3">
                        <button
                          onClick={(e) => handleAddToCart(e, product)}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          Себетке
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom">
          <div className={`px-6 py-3 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          } text-white font-medium`}>
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
