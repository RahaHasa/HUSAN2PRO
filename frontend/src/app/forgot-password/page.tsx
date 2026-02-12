'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Phone, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact,
          method: contactMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Қате орын алды');
      }

      // Save contact and method for reset password page
      localStorage.setItem('reset_contact', contact);
      localStorage.setItem('reset_method', contactMethod);
      
      // If there's a code in response (for testing), save it too
      if (data.code) {
        localStorage.setItem('test_code', data.code);
      }
      
      router.push('/reset-password');
    } catch (err: any) {
      setError(err.message || 'Қате орын алды');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-100 p-2 sm:p-4">
      <div className="flex w-[95%] max-w-5xl h-[95vh] rounded-3xl overflow-hidden shadow-2xl">
        {/* Left Side - Decorative */}
        <div className="hidden lg:flex lg:w-[60%] bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 p-12 relative overflow-hidden">
          {/* Abstract patterns */}
          <div className="absolute inset-0">
            <svg className="absolute top-10 left-10 w-32 h-32 text-white/20" viewBox="0 0 100 100">
              <path d="M10,50 Q30,30 50,50 T90,50" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M10,60 Q30,40 50,60 T90,60" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M10,70 Q30,50 50,70 T90,70" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
            
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
            
            <div className="absolute top-40 right-32 text-white/30 text-4xl font-light">+</div>
            <div className="absolute bottom-40 left-32 text-white/30 text-4xl font-light">+</div>
            
            <svg className="absolute bottom-0 right-0 w-96 h-96 text-white/10" viewBox="0 0 200 200">
              <path d="M0,100 Q50,50 100,100 T200,100 L200,200 L0,200 Z" fill="currentColor" />
            </svg>
          </div>
          
          <div className="relative z-10 flex flex-col justify-center">
            <div className="mb-8">
              <img src="/logo.svg" alt="RENT MEYRAM" className="h-32 sm:h-40 brightness-0 invert" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              Құпия сөзді қалпына келтіру
            </h1>
            <p className="text-white/90 text-lg">
              Біз сізге растау кодын жібереміз
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-[40%] bg-white p-8 lg:p-12 flex flex-col justify-center overflow-y-auto">
          <div className="lg:hidden mb-8 flex justify-center">
            <img src="/logo.svg" alt="RENT MEYRAM" className="h-32 sm:h-40" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Құпия сөзді ұмыттыңыз ба?</h2>
          <p className="text-gray-500 mb-8">Растау кодын алу үшін деректеріңізді енгізіңіз</p>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Contact Method Selection */}
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={() => setContactMethod('email')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition ${
                  contactMethod === 'email'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-gray-300 text-gray-600 hover:border-blue-300'
                }`}
              >
                <Mail className="w-5 h-5" />
                Email
              </button>
              <button
                type="button"
                onClick={() => setContactMethod('phone')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition ${
                  contactMethod === 'phone'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-gray-300 text-gray-600 hover:border-blue-300'
                }`}
              >
                <Phone className="w-5 h-5" />
                Телефон
              </button>
            </div>

            <div>
              <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-2">
                {contactMethod === 'email' ? 'Email мекенжайы' : 'Телефон нөмірі'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {contactMethod === 'email' ? (
                    <Mail className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Phone className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <input
                  id="contact"
                  type={contactMethod === 'email' ? 'email' : 'tel'}
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder={contactMethod === 'email' ? 'your@email.com' : '+7 777 123 45 67'}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? 'Жіберілуде...' : 'Код жіберу'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Құпия сөзді еске түсірдіңіз бе?{' '}
              <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition">
                Кіру
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link href="/" className="flex items-center justify-center text-sm text-gray-500 hover:text-blue-600 transition">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Басты бетке
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
