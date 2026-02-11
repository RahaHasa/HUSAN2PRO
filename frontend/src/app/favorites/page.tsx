'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { Heart, ShoppingCart, User, Menu, Trash2, ShoppingBag } from 'lucide-react';
import { getFavorites, removeFromFavorites, FavoriteItem } from '@/lib/favorites';
import Toast from '@/components/Toast';

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    loadFavorites();
    
    const handleFavoritesChange = () => {
      loadFavorites();
    };
    
    window.addEventListener('favoritesChanged', handleFavoritesChange);
    return () => window.removeEventListener('favoritesChanged', handleFavoritesChange);
  }, []);

  const loadFavorites = () => {
    setFavorites(getFavorites());
  };

  const handleRemove = (id: number) => {
    removeFromFavorites(id);
    setToast({ message: 'Таңдаулылардан жойылды', type: 'info' });
  };

  const handleAddToCart = (product: FavoriteItem) => {
    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingIndex = cartItems.findIndex((item: any) => item.id === product.id);
    
    if (existingIndex >= 0) {
      cartItems[existingIndex].quantity += 1;
    } else {
      cartItems.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        startDate: '',
        endDate: ''
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cartItems));
    setToast({ message: 'Себетке қосылды!', type: 'success' });
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

            <div className="flex items-center space-x-6">
              {user?.role !== 'admin' && (
                <>
                  <Link href="/cart" className="hover:text-gray-600 transition">
                    <ShoppingCart className="w-5 h-5" />
                  </Link>
                  <Link href="/favorites" className="text-black transition">
                    <Heart className="w-5 h-5 fill-current" />
                  </Link>
                </>
              )}
              {user ? (
                <Link href="/profile" className="text-sm font-medium hover:text-gray-600 transition flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {user.firstName}
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

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Таңдаулылар</h1>
        
        {favorites.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-lg">
            <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 font-medium mb-2">Таңдаулылар тізімі бос</p>
            <p className="text-gray-500 text-sm mb-6">Ұнаған тауарларды қосыңыз</p>
            <Link
              href="/catalog"
              className="inline-block bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition"
            >
              Каталогқа өту
            </Link>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-6">{favorites.length} тауар</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {favorites.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition"
                >
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
                      
                      {/* Remove button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemove(product.id);
                        }}
                        className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-red-500 hover:text-white text-gray-600 transition backdrop-blur-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="font-medium mb-2 line-clamp-2 text-sm sm:text-base">{product.name}</h3>
                      <p className="text-base sm:text-lg font-bold mb-3">{product.price} ₸/күн</p>
                    </div>
                  </Link>
                  
                  {/* Add to cart button */}
                  {user?.role !== 'admin' && (
                    <div className="p-3 sm:p-4 pt-0">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Себетке
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Toast */}
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
