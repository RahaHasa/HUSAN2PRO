'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api-new';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, User, Heart, Menu, FileText, Download, Calendar, Package, Phone, Mail } from 'lucide-react';
import { getFavorites } from '@/lib/favorites';
import Toast from '@/components/Toast';

interface Order {
  id: number;
  orderNumber: string;
  total: number;
  subtotal: number;
  status: string;
  phone?: string;
  deliveryAddress?: string;
  createdAt: string;
  items: {
    id: number;
    quantity: number;
    totalPrice: number;
    startDate?: string;
    endDate?: string;
    product: {
      id: number;
      name: string;
      image?: string;
      price: number;
    };
  }[];
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      loadOrders();
    }
  }, [user, authLoading, router]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getOrders();
      setOrders(data.sort((a: Order, b: Order) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadContract = async (orderId: number) => {
    try {
      await api.downloadContract(orderId);
      setToast({ message: 'Шарт сәтті жүктелді', type: 'success' });
    } catch (error) {
      console.error('Failed to download contract:', error);
      setToast({ message: 'Шартты жүктеу кезінде қате', type: 'error' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Күтілуде';
      case 'confirmed':
        return 'Расталды';
      case 'completed':
        return 'Аяқталды';
      case 'cancelled':
        return 'Болдырылмады';
      default:
        return status;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Жүктелуде...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Rent Meyram
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-600 hover:text-blue-600 transition">Басты бет</Link>
              <Link href="/profile" className="text-gray-600 hover:text-blue-600 transition">Профиль</Link>
              <Link href="/orders" className="text-blue-600 font-semibold transition">Тапсырыстар</Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/favorites" className="relative p-2 hover:bg-blue-50 rounded-full transition">
                <Heart className={`w-6 h-6 ${favorites.length > 0 ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                    {favorites.length}
                  </span>
                )}
              </Link>
              <Link href="/cart" className="relative p-2 hover:bg-blue-50 rounded-full transition">
                <ShoppingCart className="w-6 h-6 text-gray-600" />
              </Link>
              {user && (
                <Link href="/profile" className="p-2 hover:bg-blue-50 rounded-full transition">
                  <User className="w-6 h-6 text-gray-600" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Менің тапсырыстарым
          </h1>

          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Package className="w-24 h-24 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Тапсырыс жоқ</h2>
              <p className="text-gray-600 mb-6">Сіз әлі тапсырыс жасамадыңыз</p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
              >
                Сатып алуға өту
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
                  {/* Order Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold mb-1">Тапсырыс №{order.orderNumber}</h3>
                        <p className="text-blue-100 text-sm flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.createdAt).toLocaleDateString('kk-KZ', { 
                            day: '2-digit', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold">{order.total} ₸</p>
                        <span className={`inline-block mt-2 px-4 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="p-6">
                    {/* Contact Info */}
                    {(order.phone || order.deliveryAddress) && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                        <h4 className="font-semibold text-gray-900 mb-2">Байланыс ақпараты</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          {order.phone && (
                            <p className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              {order.phone}
                            </p>
                          )}
                          {order.deliveryAddress && (
                            <p className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              {order.deliveryAddress}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Items */}
                    <div className="space-y-3 mb-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                          {item.product.image && (
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{item.product.name}</h4>
                            <p className="text-sm text-gray-600">Саны: {item.quantity}</p>
                            {item.startDate && item.endDate && (
                              <p className="text-sm text-gray-600">
                                {new Date(item.startDate).toLocaleDateString('kk-KZ')} - {new Date(item.endDate).toLocaleDateString('kk-KZ')}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{item.totalPrice} ₸</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Download Contract Button */}
                    <button
                      onClick={() => handleDownloadContract(order.id)}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
                    >
                      <Download className="w-5 h-5" />
                      Жалға алу шартын жүктеу (PDF)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
