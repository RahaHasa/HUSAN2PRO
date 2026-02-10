import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">CINERENT</h3>
            <p className="text-gray-400 text-sm">
              Профессиональная аренда кинооборудования для вашего творчества
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Каталог</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/catalog" className="hover:text-white transition">Все товары</Link></li>
              <li><Link href="/catalog?category=cameras" className="hover:text-white transition">Камеры</Link></li>
              <li><Link href="/catalog?category=lenses" className="hover:text-white transition">Объективы</Link></li>
              <li><Link href="/catalog?category=light" className="hover:text-white transition">Свет</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Компания</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-white transition">О нас</Link></li>
              <li><Link href="/contacts" className="hover:text-white transition">Контакты</Link></li>
              <li><Link href="/faq" className="hover:text-white transition">FAQ</Link></li>
              <li><Link href="/terms" className="hover:text-white transition">Условия</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Контакты</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Email: info@cinerent.com</li>
              <li>Тел: +7 777 123 45 67</li>
              <li>Адрес: г. Алматы</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 CINERENT. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
