'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Phone, Calendar, ShoppingBag, LogOut, Edit2, Save, X, Camera, Upload } from 'lucide-react';
import { api } from '@/lib/api-new';

export default function ProfilePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState<string>('');
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-lg font-medium text-blue-600">Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-100">
      {/* Header */}
      <header className="bg-white border-b border-blue-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">CINERENT</Link>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">
                На главную
              </Link>
              {user.role === 'admin' && (
                <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">
                  Админ-панель
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
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
                    <span className="hidden sm:inline">Редактировать</span>
                    <span className="sm:hidden">Изменить</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      className="bg-white/20 hover:bg-white/30 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition text-xs sm:text-sm"
                    >
                      <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                      Сохранить
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                    >
                      <X className="w-4 h-4" />
                      Отмена
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
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Личные данные</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Имя
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
                    Фамилия
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
                    Email адрес
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

              {/* Настройки уведомлений */}
              <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  🔔 Настройки уведомлений
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email для уведомлений
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
                      WhatsApp для уведомлений
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
                        {user.notificationWhatsApp || user.phone || 'Не указан'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Предпочитаемый способ связи
                    </label>
                    {isEditing ? (
                      <select
                        value={editData.preferredNotification || 'email'}
                        onChange={(e) => setEditData({ ...editData, preferredNotification: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      >
                        <option value="email">📧 Email</option>
                        <option value="whatsapp">💬 WhatsApp</option>
                      </select>
                    ) : (
                      <p className="px-4 py-3 bg-white rounded-lg text-gray-900">
                        {user.preferredNotification === 'whatsapp' ? '💬 WhatsApp' : '📧 Email'}
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
                  Выйти из аккаунта
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          {user.role !== 'admin' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-bold">{rentals.length}</span>
                </div>
                <h3 className="text-sm font-medium text-blue-100">Аренды</h3>
              </div>
            </div>
          )}

          {/* Rentals Section - only for non-admin users */}
          {user.role !== 'admin' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-blue-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Мои аренды</h2>
                <p className="text-sm text-gray-500">Список всех арендованного оборудования</p>
              </div>
            </div>

            {rentals.length === 0 ? (
              <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                <div className="text-6xl mb-4">🎬</div>
                <p className="text-gray-600 font-medium mb-2">У вас пока нет аренд</p>
                <p className="text-gray-500 text-sm mb-6">Арендуйте профессиональное оборудование для ваших проектов</p>
                <Link
                  href="/catalog"
                  className="inline-block bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition shadow-lg hover:shadow-xl"
                >
                  Перейти в каталог
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {rentals.map((rental) => (
                  <div
                    key={rental.id}
                    className="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-lg transition group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">🎥</span>
                          <h3 className="font-bold text-gray-900 text-lg">
                            {rental.product?.name || 'Товар'}
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>Начало: {new Date(rental.startDate).toLocaleDateString('ru-RU')}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>Конец: {new Date(rental.endDate).toLocaleDateString('ru-RU')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-2xl text-gray-900">{rental.totalPrice} ₸</p>
                        <p className="text-xs text-gray-500 mb-2">ID: #{rental.id}</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          rental.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : rental.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {rental.status === 'active' ? '✓ Активна' : rental.status === 'pending' ? '⏳ Ожидание' : rental.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
