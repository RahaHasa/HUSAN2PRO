'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api-new';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, X, Save, Upload, Image as ImageIcon } from 'lucide-react';
import Toast from '@/components/Toast';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('products');
  
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    pricePerHour: '',
    pricePerWeek: '',
    image: '',
    categoryId: '',
    available: true,
    hasFlexiblePricing: false,
    specifications: ''
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    image: ''
  });

  const [discountForm, setDiscountForm] = useState({
    code: '',
    percentage: '',
    validFrom: '',
    validUntil: '',
    active: true
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, categoriesData, rentalsData, discountsData] = await Promise.all([
        api.getProducts().catch(() => []),
        api.getCategories().catch(() => []),
        api.getRentals().catch(() => []),
        api.getDiscounts().catch(() => []),
      ]);
      
      setProducts(productsData);
      setCategories(categoriesData);
      setRentals(rentalsData);
      setDiscounts(discountsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Product handlers
  const handleCreateProduct = async () => {
    try {
      await api.createProduct({
        ...productForm,
        price: parseFloat(productForm.price),
        pricePerHour: productForm.pricePerHour ? parseFloat(productForm.pricePerHour) : null,
        pricePerWeek: productForm.pricePerWeek ? parseFloat(productForm.pricePerWeek) : null,
        categoryId: parseInt(productForm.categoryId)
      });
      setShowProductModal(false);
      resetProductForm();
      loadData();
      setToast({ message: 'Товар успешно добавлен!', type: 'success' });
    } catch (error) {
      console.error('Failed to create product:', error);
      setToast({ message: 'Ошибка при создании товара', type: 'error' });
    }
  };

  const handleUpdateProduct = async () => {
    try {
      await api.updateProduct(editingItem.id, {
        ...productForm,
        price: parseFloat(productForm.price),
        pricePerHour: productForm.pricePerHour ? parseFloat(productForm.pricePerHour) : null,
        pricePerWeek: productForm.pricePerWeek ? parseFloat(productForm.pricePerWeek) : null,
        categoryId: parseInt(productForm.categoryId)
      });
      setShowProductModal(false);
      setEditingItem(null);
      resetProductForm();
      loadData();
      setToast({ message: 'Товар успешно обновлен!', type: 'success' });
    } catch (error) {
      console.error('Failed to update product:', error);
      setToast({ message: 'Ошибка при обновлении товара', type: 'error' });
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm('Удалить этот товар?')) {
      try {
        await api.deleteProduct(id);
        loadData();
        setToast({ message: 'Товар успешно удален!', type: 'success' });
      } catch (error) {
        console.error('Failed to delete product:', error);
        setToast({ message: 'Ошибка при удалении товара', type: 'error' });
      }
    }
  };

  const openEditProduct = (product: any) => {
    setEditingItem(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.pricePerDay?.toString() || product.price?.toString() || '',
      pricePerHour: product.pricePerHour?.toString() || '',
      pricePerWeek: product.pricePerWeek?.toString() || '',
      image: product.mainImage || product.image || '',
      categoryId: product.category?.id?.toString() || '',
      available: product.available,
      hasFlexiblePricing: product.hasFlexiblePricing || false,
      specifications: product.specifications || ''
    });
    setShowProductModal(true);
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      pricePerHour: '',
      pricePerWeek: '',
      image: '',
      categoryId: '',
      available: true,
      hasFlexiblePricing: false,
      specifications: ''
    });
  };

  // Category handlers
  const handleCreateCategory = async () => {
    try {
      await api.createCategory(categoryForm);
      setShowCategoryModal(false);
      resetCategoryForm();
      loadData();
      setToast({ message: 'Категория успешно добавлена!', type: 'success' });
    } catch (error) {
      console.error('Failed to create category:', error);
      setToast({ message: 'Ошибка при создании категории', type: 'error' });
    }
  };

  const handleUpdateCategory = async () => {
    try {
      await api.updateCategory(editingItem.id, categoryForm);
      setShowCategoryModal(false);
      setEditingItem(null);
      resetCategoryForm();
      loadData();
      setToast({ message: 'Категория успешно обновлена!', type: 'success' });
    } catch (error) {
      console.error('Failed to update category:', error);
      setToast({ message: 'Ошибка при обновлении категории', type: 'error' });
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (confirm('Удалить эту категорию?')) {
      try {
        await api.deleteCategory(id);
        loadData();
        setToast({ message: 'Категория успешно удалена!', type: 'success' });
      } catch (error) {
        console.error('Failed to delete category:', error);
        setToast({ message: 'Ошибка при удалении категории', type: 'error' });
      }
    }
  };

  const openEditCategory = (category: any) => {
    setEditingItem(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      image: category.image || ''
    });
    setShowCategoryModal(true);
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      image: ''
    });
  };

  // Discount handlers
  const handleCreateDiscount = async () => {
    try {
      await api.createDiscount({
        name: discountForm.code,
        value: parseFloat(discountForm.percentage),
        startDate: discountForm.validFrom ? new Date(discountForm.validFrom) : null,
        endDate: discountForm.validUntil ? new Date(discountForm.validUntil) : null,
        isActive: discountForm.active
      });
      setShowDiscountModal(false);
      resetDiscountForm();
      loadData();
      setToast({ message: 'Скидка успешно добавлена!', type: 'success' });
    } catch (error) {
      console.error('Failed to create discount:', error);
      setToast({ message: 'Ошибка при создании скидки', type: 'error' });
    }
  };

  const handleUpdateDiscount = async () => {
    try {
      await api.updateDiscount(editingItem.id, {
        name: discountForm.code,
        value: parseFloat(discountForm.percentage),
        startDate: discountForm.validFrom ? new Date(discountForm.validFrom) : null,
        endDate: discountForm.validUntil ? new Date(discountForm.validUntil) : null,
        isActive: discountForm.active
      });
      setShowDiscountModal(false);
      setEditingItem(null);
      resetDiscountForm();
      loadData();
      setToast({ message: 'Скидка успешно обновлена!', type: 'success' });
    } catch (error) {
      console.error('Failed to update discount:', error);
      setToast({ message: 'Ошибка при обновлении скидки', type: 'error' });
    }
  };

  const handleDeleteDiscount = async (id: number) => {
    if (confirm('Удалить эту скидку?')) {
      try {
        await api.deleteDiscount(id);
        loadData();
        setToast({ message: 'Скидка успешно удалена!', type: 'success' });
      } catch (error) {
        console.error('Failed to delete discount:', error);
        setToast({ message: 'Ошибка при удалении скидки', type: 'error' });
      }
    }
  };

  const openEditDiscount = (discount: any) => {
    setEditingItem(discount);
    setDiscountForm({
      code: discount.name || '',
      percentage: discount.value?.toString() || '',
      validFrom: discount.startDate ? new Date(discount.startDate).toISOString().split('T')[0] : '',
      validUntil: discount.endDate ? new Date(discount.endDate).toISOString().split('T')[0] : '',
      active: discount.isActive ?? true
    });
    setShowDiscountModal(true);
  };

  const resetDiscountForm = () => {
    setDiscountForm({
      code: '',
      percentage: '',
      validFrom: '',
      validUntil: '',
      active: true
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Админ-панель</h1>
              <p className="text-xs sm:text-sm text-gray-500">Управление контентом</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/" className="text-xs sm:text-sm font-medium text-gray-600 hover:text-black transition">
                На сайт
              </Link>
              <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">
                {user?.firstName} {user?.lastName}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-medium text-gray-500">Товары</h3>
              <span className="text-xl sm:text-2xl">📦</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold">{products.length}</p>
          </div>
          
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-medium text-gray-500">Категории</h3>
              <span className="text-xl sm:text-2xl">🏷️</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold">{categories.length}</p>
          </div>
          
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-medium text-gray-500">Аренды</h3>
              <span className="text-xl sm:text-2xl">🎬</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold">{rentals.length}</p>
          </div>
          
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-medium text-gray-500">Скидки</h3>
              <span className="text-xl sm:text-2xl">🎁</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold">{discounts.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 min-w-max">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-3 sm:py-4 px-2 border-b-2 font-medium text-xs sm:text-sm transition whitespace-nowrap ${
                  activeTab === 'products'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Товары ({products.length})
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`py-3 sm:py-4 px-2 border-b-2 font-medium text-xs sm:text-sm transition whitespace-nowrap ${
                  activeTab === 'categories'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Категории ({categories.length})
              </button>
              <button
                onClick={() => setActiveTab('rentals')}
                className={`py-3 sm:py-4 px-2 border-b-2 font-medium text-xs sm:text-sm transition whitespace-nowrap ${
                  activeTab === 'rentals'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Аренды ({rentals.length})
              </button>
              <button
                onClick={() => setActiveTab('discounts')}
                className={`py-3 sm:py-4 px-2 border-b-2 font-medium text-xs sm:text-sm transition whitespace-nowrap ${
                  activeTab === 'discounts'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Скидки ({discounts.length})
              </button>
            </nav>
          </div>

          <div className="p-4 sm:p-6">
            {/* Products Tab */}
            {activeTab === 'products' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg sm:text-xl font-bold">Управление товарами</h2>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      resetProductForm();
                      setShowProductModal(true);
                    }}
                    className="bg-black text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Добавить товар</span>
                    <span className="sm:hidden">Добавить</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-600">Изображение</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-600">Название</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 hidden md:table-cell">Категория</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-600">Цена</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 hidden sm:table-cell">Статус</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-600">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded" />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xl">📦</div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-sm">{product.name}</div>
                            <div className="text-xs text-gray-500 md:hidden">{product.category?.name}</div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 hidden md:table-cell">{product.category?.name || '-'}</td>
                          <td className="py-3 px-4 font-medium text-sm">${product.price}</td>
                          <td className="py-3 px-4 hidden sm:table-cell">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              product.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {product.available ? 'Доступен' : 'Недоступен'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditProduct(product)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg sm:text-xl font-bold">Управление категориями</h2>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      resetCategoryForm();
                      setShowCategoryModal(true);
                    }}
                    className="bg-black text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Добавить категорию</span>
                    <span className="sm:hidden">Добавить</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <div key={category.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg">{category.name}</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditCategory(category)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{category.description || 'Без описания'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rentals Tab */}
            {activeTab === 'rentals' && (
              <div>
                <h2 className="text-lg sm:text-xl font-bold mb-6">Управление арендами</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-600">ID</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-600">Пользователь</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 hidden md:table-cell">Товар</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-600">Период</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-600">Статус</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rentals.map((rental) => (
                        <tr key={rental.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-sm">#{rental.id}</td>
                          <td className="py-3 px-4 text-sm">{rental.user?.email}</td>
                          <td className="py-3 px-4 text-sm hidden md:table-cell">{rental.product?.name}</td>
                          <td className="py-3 px-4 text-xs">
                            {new Date(rental.startDate).toLocaleDateString()} - {new Date(rental.endDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              rental.status === 'active' ? 'bg-green-100 text-green-700' :
                              rental.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {rental.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Discounts Tab */}
            {activeTab === 'discounts' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg sm:text-xl font-bold">Управление скидками</h2>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      resetDiscountForm();
                      setShowDiscountModal(true);
                    }}
                    className="bg-black text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Добавить скидку</span>
                    <span className="sm:hidden">Добавить</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {discounts.map((discount) => (
                    <div key={discount.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg">{discount.name}</h3>
                          <p className="text-2xl font-bold text-green-600">{discount.value}%</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditDiscount(discount)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDiscount(discount.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        {discount.startDate && <p>С: {new Date(discount.startDate).toLocaleDateString()}</p>}
                        {discount.endDate && <p>До: {new Date(discount.endDate).toLocaleDateString()}</p>}
                        <span className={`inline-block px-2 py-1 rounded-full ${
                          discount.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {discount.isActive ? 'Активна' : 'Неактивна'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">
                {editingItem ? 'Редактировать товар' : 'Добавить товар'}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Название</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Canon EOS R5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Описание</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  rows={3}
                  placeholder="Профессиональная камера..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Категория</label>
                <select
                  value={productForm.categoryId}
                  onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                >
                  <option value="">Выберите категорию</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-3">Цены аренды</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Цена за день ($) *</label>
                    <input
                      type="number"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                      placeholder="150"
                    />
                  </div>

                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="hasFlexiblePricing"
                      checked={productForm.hasFlexiblePricing}
                      onChange={(e) => setProductForm({ ...productForm, hasFlexiblePricing: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    <label htmlFor="hasFlexiblePricing" className="ml-2 text-sm font-medium">🔑 Гибкие тарифы (час/неделя)</label>
                  </div>
                  
                  {productForm.hasFlexiblePricing && (
                    <div className="grid grid-cols-2 gap-4 pl-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Цена за час ($)</label>
                        <input
                          type="number"
                          value={productForm.pricePerHour}
                          onChange={(e) => setProductForm({ ...productForm, pricePerHour: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                          placeholder="25"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Цена за неделю ($)</label>
                        <input
                          type="number"
                          value={productForm.pricePerWeek}
                          onChange={(e) => setProductForm({ ...productForm, pricePerWeek: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                          placeholder="900"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Изображение товара</label>
                <div className="flex items-start gap-4">
                  {productForm.image && (
                    <div className="relative w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden">
                      <img src={productForm.image} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setProductForm({ ...productForm, image: '' })}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setProductForm({ ...productForm, image: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                      id="product-image-upload"
                    />
                    <label
                      htmlFor="product-image-upload"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer"
                    >
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600">Загрузить изображение</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG, WEBP до 5MB</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Характеристики</label>
                <textarea
                  value={productForm.specifications}
                  onChange={(e) => setProductForm({ ...productForm, specifications: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  rows={2}
                  placeholder="45MP, 8K видео, IBIS..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="available"
                  checked={productForm.available}
                  onChange={(e) => setProductForm({ ...productForm, available: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="available" className="ml-2 text-sm font-medium">Доступен для аренды</label>
              </div>
            </div>

            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowProductModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={editingItem ? handleUpdateProduct : handleCreateProduct}
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingItem ? 'Обновить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">
                {editingItem ? 'Редактировать категорию' : 'Добавить категорию'}
              </h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Название</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Камеры"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Описание</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  rows={3}
                  placeholder="Профессиональные камеры..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Фото категории</label>
                {categoryForm.image && (
                  <div className="mb-3 relative inline-block">
                    <img 
                      src={categoryForm.image} 
                      alt="Preview" 
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setCategoryForm({ ...categoryForm, image: '' })}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setCategoryForm({ ...categoryForm, image: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                />
              </div>
            </div>

            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={editingItem ? handleUpdateCategory : handleCreateCategory}
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingItem ? 'Обновить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">
                {editingItem ? 'Редактировать скидку' : 'Добавить скидку'}
              </h3>
              <button onClick={() => setShowDiscountModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Код</label>
                <input
                  type="text"
                  value={discountForm.code}
                  onChange={(e) => setDiscountForm({ ...discountForm, code: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="WINTER2026"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Процент скидки</label>
                <input
                  type="number"
                  value={discountForm.percentage}
                  onChange={(e) => setDiscountForm({ ...discountForm, percentage: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="15"
                  min="0"
                  max="100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Действует с</label>
                  <input
                    type="date"
                    value={discountForm.validFrom}
                    onChange={(e) => setDiscountForm({ ...discountForm, validFrom: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">До</label>
                  <input
                    type="date"
                    value={discountForm.validUntil}
                    onChange={(e) => setDiscountForm({ ...discountForm, validUntil: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={discountForm.active}
                  onChange={(e) => setDiscountForm({ ...discountForm, active: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="active" className="ml-2 text-sm font-medium">Активна</label>
              </div>
            </div>

            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowDiscountModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={editingItem ? handleUpdateDiscount : handleCreateDiscount}
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingItem ? 'Обновить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
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
