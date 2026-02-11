'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api-new';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, User, Heart, Menu, Clock, CheckCircle, XCircle, Edit, Trash2, Calendar } from 'lucide-react';
import { getFavorites } from '@/lib/favorites';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Rental {
  id: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  notes?: string;
  product: {
    id: number;
    name: string;
    image?: string;
    price: number;
  };
}

type TabType = 'active' | 'history' | 'all';

export default function RentalsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showRentalModal, setShowRentalModal] = useState(false);
  const [editingRental, setEditingRental] = useState<Rental | null>(null);
  const [rentalForm, setRentalForm] = useState({
    status: '',
    notes: ''
  });
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'danger'
  });

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
      loadRentals();
    }
  }, [user, authLoading, router]);

  const loadRentals = async () => {
    try {
      setLoading(true);
      const data = await api.getRentals();
      setRentals(data.sort((a: Rental, b: Rental) => 
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      ));
    } catch (error) {
      console.error('Failed to load rentals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRental = (rental: Rental) => {
    setConfirmDialog({
      show: true,
      title: 'Жалға алуды жою?',
      message: `"${rental.product.name}" жалға алуды жойғыңыз келетініне сенімдісіз бе? Бұл әрекетті болдырмауға болмайды.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.deleteRental(rental.id);
          await loadRentals();
          setConfirmDialog({ ...confirmDialog, show: false });
        } catch (error) {
          console.error('Failed to delete rental:', error);
          alert('Жалға алуды жою кезінде қате');
        }
      }
    });
  };

  const openEditRental = (rental: Rental) => {
    setEditingRental(rental);
    setRentalForm({
      status: rental.status,
      notes: rental.notes || ''
    });
    setShowRentalModal(true);
  };

  const handleUpdateRental = async () => {
    if (!editingRental) return;

    try {
      await api.updateRental(editingRental.id, {
        notes: rentalForm.notes
      });
      await loadRentals();
      setShowRentalModal(false);
      setEditingRental(null);
    } catch (error) {
      console.error('Failed to update rental:', error);
      alert('Жалға алуды жаңарту кезінде қате');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { text: string; class: string; icon: any }> = {
      pending: { text: 'Күтуде', class: 'bg-yellow-100 text-yellow-700', icon: Clock },
      active: { text: 'Белсенді', class: 'bg-green-100 text-green-700', icon: CheckCircle },
      completed: { text: 'Аяқталды', class: 'bg-gray-100 text-gray-700', icon: CheckCircle },
      cancelled: { text: 'Болдырылды', class: 'bg-red-100 text-red-700', icon: XCircle }
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.class}`}>
        <Icon className="w-4 h-4" />
        {config.text}
      </span>
    );
  };

  const getPaymentBadge = (paymentStatus: string) => {
    const paymentConfig: Record<string, { text: string; class: string }> = {
      pending: { text: 'Төленбеген', class: 'bg-orange-100 text-orange-700' },
      paid: { text: 'Төленді', class: 'bg-green-100 text-green-700' },
      failed: { text: 'Қате', class: 'bg-red-100 text-red-700' }
    };
    const config = paymentConfig[paymentStatus] || paymentConfig.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.class}`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const filterRentals = () => {
    switch (activeTab) {
      case 'active':
        return rentals.filter(r => r.status === 'active' || r.status === 'pending');
      case 'history':
        return rentals.filter(r => r.status === 'completed' || r.status === 'cancelled');
      case 'all':
      default:
        return rentals;
    }
  };

  const filteredRentals = filterRentals();

  if (authLoading || loading) {
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
          <div className="flex justify-between items-center h-16 md:h-20">
            <Link href="/" className="flex items-center">
              <img src="/logo.svg" alt="RENT MEYRAM" className="h-12 sm:h-16 md:h-20" />
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-sm font-medium hover:text-gray-600 transition">Басты бет</Link>
              <Link href="/catalog" className="text-sm font-medium hover:text-gray-600 transition">Каталог</Link>
              <Link href="/rentals" className="text-sm font-medium text-black border-b-2 border-black">Менің жалға алуларым</Link>
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

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 lg:py-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8">Менің жалға алуларым</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-3 font-medium transition border-b-2 ${
              activeTab === 'active'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Белсенді
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-medium transition border-b-2 ${
              activeTab === 'history'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Тарих
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 font-medium transition border-b-2 ${
              activeTab === 'all'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Барлығы
          </button>
        </div>

        {/* Rentals List */}
        {filteredRentals.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {activeTab === 'active' && 'Белсенді жалға алулар жоқ'}
              {activeTab === 'history' && 'Тарих бос'}
              {activeTab === 'all' && 'Сізде әлі жалға алулар жоқ'}
            </h3>
            <p className="text-gray-600 mb-6">Каталогқа өтіп, жабдықты жалға алыңыз</p>
            <Link
              href="/catalog"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Каталогқа өту
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredRentals.map((rental) => (
              <div key={rental.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Product Image */}
                  <div className="w-full lg:w-48 h-48 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    {rental.product.image ? (
                      <img
                        src={rental.product.image}
                        alt={rental.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">📦</div>
                    )}
                  </div>

                  {/* Rental Info */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{rental.product.name}</h3>
                        <div className="flex flex-wrap gap-2">
                          {getStatusBadge(rental.status)}
                          {getPaymentBadge(rental.paymentStatus)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-black">{rental.totalPrice} ₸</div>
                        <div className="text-sm text-gray-500">
                          {calculateDays(rental.startDate, rental.endDate)} күн
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Басталу күні</div>
                        <div className="font-medium">{formatDate(rental.startDate)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Аяқталу күні</div>
                        <div className="font-medium">{formatDate(rental.endDate)}</div>
                      </div>
                    </div>

                    {rental.notes && (
                      <div className="mb-4">
                        <div className="text-sm text-gray-500 mb-1">Ескертпе</div>
                        <div className="text-gray-700">{rental.notes}</div>
                      </div>
                    )}

                    {/* Actions - only for pending rentals */}
                    {rental.status === 'pending' && (
                      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => openEditRental(rental)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium"
                        >
                          <Edit className="w-4 h-4" />
                          Өзгерту
                        </button>
                        <button
                          onClick={() => handleDeleteRental(rental)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium"
                        >
                          <Trash2 className="w-4 h-4" />
                          Жою
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Edit Rental Modal */}
      {showRentalModal && editingRental && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Жалға алуды өзгерту</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ескертпе
              </label>
              <textarea
                value={rentalForm.notes}
                onChange={(e) => setRentalForm({ ...rentalForm, notes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="Жалға алуға түсініктеме қосыңыз..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleUpdateRental}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Сақтау
              </button>
              <button
                onClick={() => {
                  setShowRentalModal(false);
                  setEditingRental(null);
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                Болдырмау
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmDialog.show && (
        <ConfirmDialog
          isOpen={confirmDialog.show}
          title={confirmDialog.title}
          message={confirmDialog.message}
          type={confirmDialog.type}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog({ ...confirmDialog, show: false })}
        />
      )}
    </div>
  );
}
