'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-100 p-2 sm:p-4">
      <div className="flex w-[95%] h-[95vh] rounded-3xl overflow-hidden shadow-2xl">
        {/* Left Side - Decorative */}
        <div className="hidden lg:flex lg:w-[60%] bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 p-12 relative overflow-hidden">
          {/* Abstract patterns */}
          <div className="absolute inset-0">
            {/* Wavy lines */}
            <svg className="absolute top-10 left-10 w-32 h-32 text-white/20" viewBox="0 0 100 100">
              <path d="M10,50 Q30,30 50,50 T90,50" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M10,60 Q30,40 50,60 T90,60" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M10,70 Q30,50 50,70 T90,70" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
            
            {/* Circles and dots */}
            <div className="absolute top-20 right-20 w-16 h-16 border-4 border-white/30 rounded-full"></div>
            <div className="absolute bottom-32 left-20 w-12 h-12 border-4 border-white/30 rounded-full"></div>
            <div className="absolute top-1/3 right-1/4">
              <div className="grid grid-cols-3 gap-2">
                <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                <div className="w-2 h-2 bg-white/40 rounded-full"></div>
              </div>
            </div>
            
            {/* Plus signs */}
            <div className="absolute top-40 right-32 text-white/30 text-4xl font-light">+</div>
            <div className="absolute bottom-40 left-32 text-white/30 text-4xl font-light">+</div>
            
            {/* Large wavy shape */}
            <svg className="absolute bottom-0 right-0 w-96 h-96 text-white/10" viewBox="0 0 200 200">
              <path d="M0,100 Q50,50 100,100 T200,100 L200,200 L0,200 Z" fill="currentColor" />
            </svg>
          </div>
          
          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center">
            <div className="mb-8">
              <img src="/logo.svg" alt="RENT MEYRAM" className="h-32 sm:h-40 brightness-0 invert" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              Қосылыңыз!
            </h1>
            <p className="text-white/90 text-lg">
              Аккаунт жасаңыз және бізбен бірге жұмыс бастаңыз
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-[40%] bg-white p-8 lg:p-12 flex flex-col justify-center">
          <div className="lg:hidden mb-8 flex justify-center">
            <img src="/logo.svg" alt="RENT MEYRAM" className="h-32 sm:h-40" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Тіркелу</h2>
          <p className="text-gray-500 mb-6">Аккаунт жасау үшін пішінді толтырыңыз</p>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  Аты
                </label>
                <input
                  id="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Асет"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Тегі
                </label>
                <input
                  id="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Жұмабаев"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email мекенжайы
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Телефон (қосымша)
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="+7 777 123 45 67"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Құпия сөз
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Кемінде 6 таңба"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">6 таңбадан кем емес пайдаланыңыз</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? 'Жүктелуде...' : 'Тіркелу'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Аккаунтыңыз бар ма?{' '}
              <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition">
                Кіру
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link href="/" className="flex items-center justify-center text-sm text-gray-500 hover:text-blue-600 transition">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Басты бетке
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
