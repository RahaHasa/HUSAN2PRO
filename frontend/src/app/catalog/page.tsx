'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-new';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { ShoppingCart, User, Heart, Menu, Search, Filter, ShoppingBag } from 'lucide-react';
import { isFavorite, addToFavorites, removeFromFavorites } from '@/lib/favorites';
import Toast from '@/components/Toast';

export default function CatalogPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    loadFavorites();
    
    // Listen for favorites changes
    const handleFavoritesChange = () => {
      loadFavorites();
    };
    
    window.addEventListener('favoritesChanged', handleFavoritesChange);
    return () => window.removeEventListener('favoritesChanged', handleFavoritesChange);
  }, []);

  const loadFavorites = () => {
    const favs = products.map(p => p.id).filter(id => isFavorite(id));
    setFavorites(favs);
  };

  useEffect(() => {
    Promise.all([
      api.getProducts().catch(() => []),
      api.getCategories().catch(() => [])
    ])
      .then(([productsData, categoriesData]) => {
        setProducts(productsData);
        setCategories(categoriesData);
        loadFavorites();
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleToggleFavorite = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
      setToast({ message: 'Таңдаулылардан жойылды', type: 'info' });
    } else {
      addToFavorites({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image
      });
      setToast({ message: 'Таңдаулыларға қосылды!', type: 'success' });
    }
    loadFavorites();
  };

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category?.id === parseInt(selectedCategory);
    return matchesSearch && matchesCategory;
  });

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
              <Link href="/catalog" className="text-sm font-medium text-black">Каталог</Link>              {user && user.role !== 'admin' && (
                <Link href="/rentals" className="text-sm font-medium hover:text-gray-600 transition">Менің жалға алуым</Link>
              )}              {user?.role === 'admin' && (
                <Link href="/admin" className="text-sm font-medium hover:text-gray-600 transition">Әкімші</Link>
              )}
            </nav>

            <div className="flex items-center space-x-6">
              {user?.role !== 'admin' && (
                <>
                  <Link href="/cart" className="hover:text-gray-600 transition">
                    <ShoppingCart className="w-5 h-5" />
                  </Link>
                  <Link href="/favorites" className="hover:text-gray-600 transition">
                    <Heart className="w-5 h-5" />
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

      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Page Title */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Жабдық каталогы</h1>
          <p className="text-sm sm:text-base text-gray-600">{filteredProducts.length} тауар</p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Атауы бойынша іздеу..."
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
                Барлық санаттар
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
            <div className="text-lg font-medium">Жүктелуде...</div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Тауарлар табылмады</p>
            <p className="text-gray-400 mt-2">Іздеу параметрлерін өзгертіп көріңіз</p>
          </div>
        ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition relative"
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
                      <div className="w-full h-full flex items-center justify-center text-5xl"></div>
                    )}
                    {!product.available && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                        Қолжетімсіз
                      </div>
                    )}
                    
                    {/* Favorite button */}
                    <button
                      onClick={(e) => handleToggleFavorite(e, product)}
                      className={`absolute top-2 left-2 p-2 rounded-full backdrop-blur-sm transition ${
                        favorites.includes(product.id)
                          ? 'bg-red-500 text-white'
                          : 'bg-white/80 text-gray-600 hover:bg-white'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${favorites.includes(product.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  <div className="p-3 sm:p-4">
                    <p className="text-xs text-gray-500 mb-1">{product.category?.name || 'Санатсыз'}</p>
                    <h3 className="font-medium mb-2 line-clamp-2 text-sm sm:text-base">{product.name}</h3>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-base sm:text-lg font-bold">{product.price} ₸/день</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          product.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {product.available ? 'Қолжетімді' : 'Қолжетімсіз'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
                
                {/* Add to cart button - only for non-admin */}
                {user?.role !== 'admin' && product.available && (
                  <div className="p-3 sm:p-4 pt-0">
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 text-sm font-medium"
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
