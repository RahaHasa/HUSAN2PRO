import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">RENT MEYRAM</h3>
            <p className="text-blue-200 text-sm">
              Шығармашылық үшін кіно жабдықтарын кәсіби жалға алу
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Каталог</h4>
            <ul className="space-y-2 text-sm text-blue-200">
              <li><Link href="/catalog" className="hover:text-white transition">Барлық тауарлар</Link></li>
              <li><Link href="/catalog?category=cameras" className="hover:text-white transition">Камералар</Link></li>
              <li><Link href="/catalog?category=lenses" className="hover:text-white transition">Объективтер</Link></li>
              <li><Link href="/catalog?category=light" className="hover:text-white transition">Жарық</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Компания</h4>
            <ul className="space-y-2 text-sm text-blue-200">
              <li><Link href="/about" className="hover:text-white transition">Біз туралы</Link></li>
              <li><Link href="/contacts" className="hover:text-white transition">Байланыстар</Link></li>
              <li><Link href="/faq" className="hover:text-white transition">Жиі қойылатын сұрақтар</Link></li>
              <li><Link href="/terms" className="hover:text-white transition">Шарттар</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Байланыстар</h4>
            <ul className="space-y-2 text-sm text-blue-200">
              <li>Email: info@rentmeyram.com</li>
              <li>Тел: +7 777 123 45 67</li>
              <li>Мекенжай: Алматы қ.</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-blue-700 pt-8 text-center text-sm text-blue-200">
          <p>&copy; 2026 RENT MEYRAM</p>
        </div>
      </div>
    </footer>
  );
}
