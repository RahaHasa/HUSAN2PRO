'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<'code' | 'password'>('code');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contact, setContact] = useState('');
  const [method, setMethod] = useState('email');

  useEffect(() => {
    const savedContact = localStorage.getItem('reset_contact');
    const savedMethod = localStorage.getItem('reset_method');
    
    if (!savedContact) {
      router.push('/forgot-password');
      return;
    }
    
    setContact(savedContact);
    setMethod(savedMethod || 'email');
  }, [router]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const enteredCode = code.join('');
    
    if (enteredCode.length !== 6) {
      setError('6 таңбалы кодты енгізіңіз');
      setLoading(false);
      return;
    }

    try {
      // Just proceed to password step - verification will happen on backend
      setStep('password');
    } catch (err: any) {
      setError(err.message || 'Қате орын алды');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Құпия сөз 6 таңбадан кем болмауы керек');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Құпия сөздер сәйкес келмейді');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact,
          code: code.join(''),
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Қате орын алды');
      }
      
      // Clear saved data
      localStorage.removeItem('reset_contact');
      localStorage.removeItem('reset_method');
      localStorage.removeItem('test_code');
      
      router.push('/login?reset=success');
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
              {step === 'code' ? 'Растау коды' : 'Жаңа құпия сөз'}
            </h1>
            <p className="text-white/90 text-lg">
              {step === 'code' 
                ? `Біз ${method === 'email' ? 'email' : 'телефонға'} код жібердік` 
                : 'Жаңа құпия сөзіңізді жасаңыз'}
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-[40%] bg-white p-8 lg:p-12 flex flex-col justify-center overflow-y-auto">
          <div className="lg:hidden mb-8 flex justify-center">
            <img src="/logo.svg" alt="RENT MEYRAM" className="h-32 sm:h-40" />
          </div>
          
          {step === 'code' ? (
            <>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Кодты енгізіңіз</h2>
              <p className="text-gray-500 mb-8">
                {method === 'email' ? contact : contact} мекенжайына жіберілген 6 таңбалы кодты енгізіңіз
              </p>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleVerifyCode} className="space-y-6">
                <div className="flex gap-2 justify-center">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(index, e)}
                      className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  {loading ? 'Тексерілуде...' : 'Растау'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button className="text-sm text-blue-600 hover:underline">
                  Кодты қайта жіберу
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Жаңа құпия сөз</h2>
              <p className="text-gray-500 mb-8">Жаңа құпия сөзіңізді енгізіңіз</p>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Жаңа құпия сөз
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Кемінде 6 таңба"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Құпия сөзді растау
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Құпия сөзді қайталаңыз"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  {loading ? 'Сақталуда...' : 'Құпия сөзді жаңарту'}
                </button>
              </form>
            </>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link href="/login" className="flex items-center justify-center text-sm text-gray-500 hover:text-blue-600 transition">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Кіруге оралу
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
