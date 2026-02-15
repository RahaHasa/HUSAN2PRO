# Cinema Equipment Rental - Маркетплейс аренды кинооборудования

Современный fullstack проект для аренды профессионального кинооборудования, вдохновленный дизайном yume.rent.

## Технологии

### Backend
- **NestJS** - прогрессивный Node.js фреймворк
- **TypeScript** - типизация
- **PostgreSQL** - база данных
- **TypeORM** - ORM
- **JWT** - авторизация
- **bcrypt** - хэширование паролей

### Frontend
- **Next.js 14** - React фреймворк с App Router
- **TypeScript** - типизация
- **Tailwind CSS** - стилизация
- **shadcn/ui** - UI компоненты
- **Lucide Icons** - иконки

## Установка и запуск

### Backend

```bash
cd backend
npm install
npm run start:dev
```

Backend запустится на http://localhost:3000

### Frontend

```bash
cd frontend
npm install
PORT=3001 npm run dev
```

Frontend запустится на http://localhost:3001

### База данных

Настройки подключения к PostgreSQL в `backend/src/config/typeorm.config.ts`:
- Host: localhost
- Port: 5432
- User: postgres
- Password: jabir
- Database: cinema_equipment_db

##  Учетные данные администратора

**Email:** admin@cinema.com  
**Пароль:** admin123

##  Дизайн

Дизайн вдохновлен современным минималистичным стилем yume.rent:
- Чистый белый фон
- Черные акценты
- Карточный дизайн товаров
- Плавные анимации
- Адаптивная верстка

##  Структура проекта

```
fullstack/
├── backend/
│   └── src/
│       ├── auth/          # Аутентификация
│       ├── categories/    # Категории
│       ├── discounts/     # Скидки
│       ├── orders/        # Заказы
│       ├── products/      # Товары
│       ├── rentals/       # Аренды
│       └── users/         # Пользователи
│
└── frontend/
    └── src/
        ├── app/
        │   ├── admin/     # Админ-панель
        │   ├── catalog/   # Каталог
        │   ├── login/     # Вход
        │   └── register/  # Регистрация
        ├── components/    # Компоненты
        └── lib/          # Утилиты и API
```

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Получить текущего пользователя
- `POST /api/auth/logout` - Выход

### Товары
- `GET /api/products` - Список товаров
- `GET /api/products/:id` - Один товар
- `POST /api/products` - Создать товар (admin)
- `PUT /api/products/:id` - Обновить товар (admin)
- `DELETE /api/products/:id` - Удалить товар (admin)

### Категории
- `GET /api/categories` - Список категорий
- `POST /api/categories` - Создать категорию (admin)
- `PUT /api/categories/:id` - Обновить категорию (admin)
- `DELETE /api/categories/:id` - Удалить категорию (admin)

### Аренды
- `GET /api/rentals` - Список аренд
- `POST /api/rentals` - Создать аренду
- `PUT /api/rentals/:id` - Обновить аренду
- `DELETE /api/rentals/:id` - Удалить аренду

### Скидки
- `GET /api/discounts` - Список скидок
- `POST /api/discounts` - Создать скидку (admin)
- `PUT /api/discounts/:id` - Обновить скидку (admin)
- `DELETE /api/discounts/:id` - Удалить скидку (admin)

## Особенности

 Полноценная система аутентификации с JWT  
 Разделение ролей (admin/user)  
 CRUD операции для всех сущностей  
 Адаптивный дизайн  
 Современный UI в стиле yume.rent  
 Каталог с фильтрацией и поиском  
 Админ-панель с статистикой  

##  Следующие шаги

Для полноценного функционирования добавьте данные через админ-панель:
1. Создайте категории
2. Добавьте товары
3. Настройте скидки

##  Лицензия

MIT
# HUSAN2PRO
