'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Phone, Calendar, ShoppingBag, LogOut, Edit2, Save, X, Camera, Upload } from 'lucide-react';
import { api } from '@/lib/api-new';
import ConfirmDialog from '@/components/ConfirmDialog';
import Toast from '@/components/Toast';

export default function ProfilePage() {
  const { user, loading: authLoading, logout, refreshUser } = useAuth();
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

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    instagram: '',
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
        instagram: user.instagram || '',
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
    try {
      // Телефон номерлерін форматтау
      const formattedData = {
        ...editData,
        phone: formatPhoneNumber(editData.phone),
        notificationWhatsApp: formatPhoneNumber(editData.notificationWhatsApp),
      };

      const response = await api.updateProfile(formattedData);
      
      // Context жаңарту үшін
      await refreshUser();
      
      // Toast хабарлама көрсету
      setToast({ message: 'Деректеріңіз жаңартылды', type: 'success' });
      
      setIsEditing(false);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      setToast({ message: error.message || 'Профильді жаңарту кезінде қате', type: 'error' });
    }
  };

  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return '';
    
    // Барлық бос орындар, жақшалар, сызықшаларды жою
    let cleaned = phone.replace(/[\s\(\)\-]/g, '');
    
    // Егер + жоқ болса және 7 немесе 8-мен басталса
    if (!cleaned.startsWith('+')) {
      if (cleaned.startsWith('8')) {
        cleaned = '+7' + cleaned.slice(1);
      } else if (cleaned.startsWith('7')) {
        cleaned = '+' + cleaned;
      } else {
        cleaned = '+7' + cleaned;
      }
    }
    
    return cleaned;
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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-cyan-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        {/* Wavy lines */}
        <svg className="absolute top-10 left-10 w-32 h-32 text-blue-600" viewBox="0 0 100 100">
          <path d="M10,50 Q30,30 50,50 T90,50" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M10,60 Q30,40 50,60 T90,60" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M10,70 Q30,50 50,70 T90,70" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
        
        {/* Circles */}
        <div className="absolute top-20 right-20 w-24 h-24 border-4 border-blue-400 rounded-full"></div>
        <div className="absolute bottom-32 left-20 w-16 h-16 border-4 border-cyan-400 rounded-full"></div>
        
        {/* Dots grid */}
        <div className="absolute top-1/3 right-1/4">
          <div className="grid grid-cols-4 gap-3">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="w-2 h-2 bg-blue-400 rounded-full"></div>
            ))}
          </div>
        </div>
        
        {/* Plus signs */}
        <div className="absolute top-40 right-32 text-blue-400 text-6xl font-light">+</div>
        <div className="absolute bottom-40 left-32 text-cyan-400 text-6xl font-light">+</div>
        
        {/* Large wavy shape */}
        <svg className="absolute bottom-0 right-0 w-96 h-96 text-blue-300" viewBox="0 0 200 200">
          <path d="M0,100 Q50,50 100,100 T200,100 L200,200 L0,200 Z" fill="currentColor" />
        </svg>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/90 backdrop-blur-md border-b border-blue-200 shadow-sm">
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

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 lg:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Profile Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden mb-8 border border-white/50">
            {/* Header with gradient */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 px-4 sm:px-6 md:px-8 py-8 md:py-12 text-white relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute inset-0 opacity-10">
                <svg className="absolute top-4 right-10 w-20 h-20" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="2" fill="none" />
                </svg>
                <div className="absolute bottom-4 left-10 w-12 h-12 border-2 border-white rounded-full"></div>
                <div className="absolute top-1/2 right-20">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
              
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-1 sm:gap-2 z-10">
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
              
              <div className="flex items-center gap-3 sm:gap-4 md:gap-6 relative z-10">
                <div className="relative group">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm border-3 sm:border-4 md:border-4 border-white/50 overflow-hidden shadow-2xl">
                    {avatar ? (
                      <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 text-white" />
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition">
                      <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-xl sm:text-2xl md:text-4xl font-bold mb-1 sm:mb-2 drop-shadow-lg">
                    {user.firstName} {user.lastName}
                  </h1>
                  <p className="text-white/90 flex items-center gap-2 text-xs sm:text-sm md:text-base drop-shadow">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    <span className="truncate">{user.email}</span>
                  </p>
                  <div className="mt-2 sm:mt-3 inline-block">
                    <span className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-lg ${
                      user.role === 'admin' 
                        ? 'bg-yellow-400 text-yellow-900' 
                        : 'bg-white/90 text-blue-700'
                    }`}>
                      {user.role === 'admin' ? 'Әкімші' : 'Қолданушы'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-white to-blue-50/30">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Жеке ақпарат
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Аты
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.firstName}
                      onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white shadow-sm"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-blue-50 rounded-xl text-gray-900 font-medium border border-blue-100">{user.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Тегі
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.lastName}
                      onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white shadow-sm"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-blue-50 rounded-xl text-gray-900 font-medium border border-blue-100">{user.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email (кіру үшін)
                  </label>
                  {isEditing ? (
                    <div>
                      <input
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white shadow-sm"
                      />
                      <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                        ⚠️ Email өзгерткенде абай болыңыз
                      </p>
                    </div>
                  ) : (
                    <p className="px-4 py-3 bg-blue-50 rounded-xl text-gray-900 font-medium border border-blue-100">{user.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Телефон/WhatsApp
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white shadow-sm"
                      placeholder="+77082475131"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-blue-50 rounded-xl text-gray-900 font-medium border border-blue-100">
                      {user.phone || 'Көрсетілмеген'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Instagram
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.instagram}
                      onChange={(e) => setEditData({ ...editData, instagram: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white shadow-sm"
                      placeholder="@username"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-blue-50 rounded-xl text-gray-900 font-medium border border-blue-100">
                      {user.instagram || 'Көрсетілмеген'}
                    </p>
                  )}
                </div>
              </div>

              {/* Хабарландырулар баптаулары */}
              <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-white rounded-2xl border-2 border-blue-200 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  Хабарландырулар баптаулары
                </h3>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Хабарландырулар үшін Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editData.notificationEmail || editData.email}
                        onChange={(e) => setEditData({ ...editData, notificationEmail: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white shadow-sm"
                        placeholder="notification@email.com"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-white rounded-xl text-gray-900 font-medium border border-blue-100 shadow-sm">
                        {user.notificationEmail || user.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Хабарландырулар үшін WhatsApp
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editData.notificationWhatsApp || editData.phone}
                        onChange={(e) => setEditData({ ...editData, notificationWhatsApp: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white shadow-sm"
                        placeholder="+7 777 123 45 67"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-white rounded-xl text-gray-900 font-medium border border-blue-100 shadow-sm">
                        {user.notificationWhatsApp || user.phone || 'Көрсетілмеген'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Байланыс әдісі
                    </label>
                    {isEditing ? (
                      <select
                        value={editData.preferredNotification || 'email'}
                        onChange={(e) => setEditData({ ...editData, preferredNotification: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white shadow-sm"
                      >
                        <option value="email">Email</option>
                        <option value="whatsapp">WhatsApp</option>
                      </select>
                    ) : (
                      <p className="px-4 py-3 bg-white rounded-xl text-gray-900 font-medium border border-blue-100 shadow-sm">
                        {user.preferredNotification === 'whatsapp' ? 'WhatsApp' : 'Email'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              

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
