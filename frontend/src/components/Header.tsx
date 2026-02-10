'use client';

import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { ShoppingCart, User, Heart, Menu } from 'lucide-react';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-black">CINERENT</Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium hover:text-gray-600 transition">Главная</Link>
            <Link href="/catalog" className="text-sm font-medium hover:text-gray-600 transition">Каталог</Link>
            {user?.role === 'admin' && (
              <Link href="/admin" className="text-sm font-medium hover:text-gray-600 transition">Админ</Link>
            )}
          </nav>

          <div className="flex items-center space-x-6">
            <button className="hover:text-gray-600 transition">
              <ShoppingCart className="w-5 h-5" />
            </button>
            <button className="hover:text-gray-600 transition">
              <Heart className="w-5 h-5" />
            </button>
            {user ? (
              <Link href="/profile" className="text-sm font-medium hover:text-gray-600 transition flex items-center gap-2">
                <User className="w-5 h-5" />
                {user.firstName}
              </Link>
            ) : (
              <Link href="/login" className="text-sm font-medium hover:text-gray-600 transition">Войти</Link>
            )}
            <button className="md:hidden">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
