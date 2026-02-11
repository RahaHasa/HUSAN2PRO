'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Phone, Calendar, ShoppingBag, LogOut, Edit2, Save, X, Camera, Upload } from 'lucide-react';
import { api } from '@/lib/api-new';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function ProfilePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState<string>('');

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notificationEmail: '',
    notificationWhatsApp: '',
    preferredNotification: 'email',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setEditData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        notificationEmail: user.notificationEmail || user.email,
        notificationWhatsApp: user.notificationWhatsApp || user.phone || '',
        preferredNotification: user.preferredNotification || 'email',
      });
      // Загрузка аватара из localStorage или использование дефолтного
      const savedAvatar = localStorage.getItem(`avatar_${user.id}`);
      if (savedAvatar) {
        setAvatar(savedAvatar);
      }
      loadUserData();
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatar(base64String);
        if (user) {
          localStorage.setItem(`avatar_${user.id}`, base64String);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const loadUserData = async () => {
    try {
      const rentalsData = await api.getRentals().catch(() => []);
      setRentals(rentalsData);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleSave = async () => {
    // TODO: Implement user update API
    setIsEditing(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-cyan-100">
        <div className="text-lg font-medium text-blue-600">Жүктелуде...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-cyan-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center">
              <img src="/logo.svg" alt="RENT MEYRAM" className="h-12 sm:h-16 md:h-20" />
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">Басты бет</Link>
              <Link href="/catalog" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">Каталог</Link>
              {user && user.role !== 'admin' && (
                <Link href="/rentals" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">Менің жалға алуым</Link>
              )}
              {user.role === 'admin' && (
                <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">Әкімші</Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 lg:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-blue-100">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-4 sm:px-6 md:px-8 py-8 md:py-12 text-white relative">
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-1 sm:gap-2">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-white/20 hover:bg-white/30 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition text-xs sm:text-sm"
                  >
                    <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Өзгерту</span>
                    <span className="sm:hidden">Өзгерту</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      className="bg-white/20 hover:bg-white/30 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition text-xs sm:text-sm"
                    >
                      <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                      Сақтау
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                    >
                      <X className="w-4 h-4" />
                      Болдырмау
                    </button>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
                <div className="relative group">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 sm:border-3 md:border-4 border-white/30 overflow-hidden">
                    {avatar ? (
                      <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl sm:text-4xl md:text-5xl">👤</span>
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition">
                      <Camera className="w-6 h-6 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">
                    {user.firstName} {user.lastName}
                  </h1>
                  <p className="text-blue-100 flex items-center gap-2 text-xs sm:text-sm">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="truncate">{user.email}</span>
                  </p>
                  <div className="mt-2 inline-block">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' 
                        ? 'bg-yellow-400 text-yellow-900' 
                        : 'bg-blue-400 text-blue-900'
                    }`}>
                      {user.role === 'admin' ? '👑 Администратор' : '👤 Пользователь'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="p-4 sm:p-6 md:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Жеке ақпарат</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Аты
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.firstName}
                      onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{user.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Тегі
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.lastName}
                      onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{user.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email мекенжайы
                  </label>
                  {isEditing ? (
                    <div>
                      <input
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      />
                      <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                        ⚠️ Будьте внимательны при изменении email
                      </p>
                    </div>
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{user.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Телефон
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="+7 777 123 45 67"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                      {user.phone || 'Не указан'}
                    </p>
                  )}
                </div>
              </div>

              {/* Хабарландырулар баптаулары */}
              <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Хабарландырулар баптаулары
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Хабарландырулар үшін Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editData.notificationEmail || editData.email}
                        onChange={(e) => setEditData({ ...editData, notificationEmail: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="notification@email.com"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-white rounded-lg text-gray-900">
                        {user.notificationEmail || user.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Хабарландырулар үшін WhatsApp
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editData.notificationWhatsApp || editData.phone}
                        onChange={(e) => setEditData({ ...editData, notificationWhatsApp: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="+7 777 123 45 67"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-white rounded-lg text-gray-900">
                        {user.notificationWhatsApp || user.phone || 'Көрсетілмеген'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Байланыс әдісі
                    </label>
                    {isEditing ? (
                      <select
                        value={editData.preferredNotification || 'email'}
                        onChange={(e) => setEditData({ ...editData, preferredNotification: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      >
                        <option value="email">Email</option>
                        <option value="whatsapp">WhatsApp</option>
                      </select>
                    ) : (
                      <p className="px-4 py-3 bg-white rounded-lg text-gray-900">
                        {user.preferredNotification === 'whatsapp' ? 'WhatsApp' : 'Email'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 flex items-start gap-2">
                    <span className="text-lg">💡</span>
                    <span>
                      <strong>Совет:</strong> Убедитесь, что все данные заполнены корректно. 
                      После изменения email, вам может потребоваться подтверждение.
                    </span>
                  </p>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition"
                >
                  <LogOut className="w-5 h-5" />
                  Шығу
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        confirmText="Отменить аренду"
        cancelText="Не отменять"
        type={confirmDialog.type}
      />
    </div>
  );
}
