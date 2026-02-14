'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api-new';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, X, Save, Upload, Image as ImageIcon, Home, LogOut, Package, Tag, Film, Gift } from 'lucide-react';
import Toast from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';

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
  const [showRentalModal, setShowRentalModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    categoryId: '',
    available: true,
    stock: '1',
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

  const [rentalForm, setRentalForm] = useState({
    status: '',
    paymentStatus: ''
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
        stock: parseInt(productForm.stock) || 1,
        categoryId: parseInt(productForm.categoryId)
      });
      setShowProductModal(false);
      resetProductForm();
      loadData();
      setToast({ message: 'Тауар сәтті қосылды!', type: 'success' });
    } catch (error) {
      console.error('Failed to create product:', error);
      setToast({ message: 'Тауар жасау кезінде қате', type: 'error' });
    }
  };

  const handleUpdateProduct = async () => {
    try {
      await api.updateProduct(editingItem.id, {
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock) || 1,
        categoryId: parseInt(productForm.categoryId)
      });
      setShowProductModal(false);
      setEditingItem(null);
      resetProductForm();
      loadData();
      setToast({ message: 'Тауар сәтті жаңартылды!', type: 'success' });
    } catch (error) {
      console.error('Failed to update product:', error);
      setToast({ message: 'Тауарды жаңарту кезінде қате', type: 'error' });
    }
  };

  const handleDeleteProduct = async (id: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Бұл тауарды жою керек пе?',
      message: 'Бұл әрекетті болдырмауға болмайды. Тауар толығымен жойылады.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.deleteProduct(id);
          loadData();
          setToast({ message: 'Тауар сәтті жойылды!', type: 'success' });
        } catch (error) {
          console.error('Failed to delete product:', error);
          setToast({ message: 'Тауарды жою кезінде қате', type: 'error' });
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const openEditProduct = (product: any) => {
    setEditingItem(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.pricePerDay?.toString() || product.price?.toString() || '',
      image: product.mainImage || product.image || '',
      categoryId: product.category?.id?.toString() || '',
      available: product.available,
      stock: product.stock?.toString() || '1',
      specifications: product.specifications || ''
    });
    setShowProductModal(true);
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      image: '',
      categoryId: '',
      available: true,
      stock: '1',
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
      setToast({ message: 'Санат сәтті қосылды!', type: 'success' });
    } catch (error) {
      console.error('Failed to create category:', error);
      setToast({ message: 'Санат жасау кезінде қате', type: 'error' });
    }
  };

  const handleUpdateCategory = async () => {
    try {
      await api.updateCategory(editingItem.id, categoryForm);
      setShowCategoryModal(false);
      setEditingItem(null);
      resetCategoryForm();
      loadData();
      setToast({ message: 'Санат сәтті жаңартылды!', type: 'success' });
    } catch (error) {
      console.error('Failed to update category:', error);
      setToast({ message: 'Санатты жаңарту кезінде қате', type: 'error' });
    }
  };

  const handleDeleteCategory = async (id: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Бұл санатты жою керек пе?',
      message: 'Бұл санаттың барлық тауарлары санатсыз қалады.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.deleteCategory(id);
          loadData();
          setToast({ message: 'Санат сәтті жойылды!', type: 'success' });
        } catch (error) {
          console.error('Failed to delete category:', error);
          setToast({ message: 'Санатты жою кезінде қате', type: 'error' });
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
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
      setToast({ message: 'Жеңілдік сәтті қосылды!', type: 'success' });
    } catch (error) {
      console.error('Failed to create discount:', error);
      setToast({ message: 'Жеңілдік жасау кезінде қате', type: 'error' });
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
      setToast({ message: 'Жеңілдік сәтті жаңартылды!', type: 'success' });
    } catch (error) {
      console.error('Failed to update discount:', error);
      setToast({ message: 'Жеңілдікті жаңарту кезінде қате', type: 'error' });
    }
  };

  const handleDeleteDiscount = async (id: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Бұл жеңілдікті жою керек пе?',
      message: 'Промокод пайдалануға қолжетімсіз болады.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.deleteDiscount(id);
          loadData();
          setToast({ message: 'Жеңілдік сәтті жойылды!', type: 'success' });
        } catch (error) {
          console.error('Failed to delete discount:', error);
          setToast({ message: 'Жеңілдікті жою кезінде қате', type: 'error' });
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
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

  // Rental handlers
  const handleUpdateRental = async () => {
    try {
      await api.updateRental(editingItem.id, {
        status: rentalForm.status,
        paymentStatus: rentalForm.paymentStatus
      });
      setShowRentalModal(false);
      setEditingItem(null);
      resetRentalForm();
      loadData();
      setToast({ message: 'Жалға алу сәтті жаңартылды!', type: 'success' });
    } catch (error) {
      console.error('Failed to update rental:', error);
      setToast({ message: 'Жалға алуды жаңарту кезінде қате', type: 'error' });
    }
  };

  const handleDeleteRental = async (id: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Бұл жалға алуды жою керек пе?',
      message: 'Жалға алу туралы барлық ақпарат жойылады.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.deleteRental(id);
          loadData();
          setToast({ message: 'Жалға алу сәтті жойылды!', type: 'success' });
        } catch (error) {
          console.error('Failed to delete rental:', error);
          setToast({ message: 'Жалға алуды жою кезінде қате', type: 'error' });
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const openEditRental = (rental: any) => {
    setEditingItem(rental);
    setRentalForm({
      status: rental.status || 'pending',
      paymentStatus: rental.paymentStatus || 'pending'
    });
    setShowRentalModal(true);
  };

  const resetRentalForm = () => {
    setRentalForm({
      status: '',
      paymentStatus: ''
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Жүктелуде...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Abstract Background Patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Wavy lines */}
        <svg className="absolute top-0 left-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="wave" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M0 50 Q 25 30, 50 50 T 100 50" stroke="#1e40af" fill="none" strokeWidth="1"/>
              <path d="M0 60 Q 25 40, 50 60 T 100 60" stroke="#1e40af" fill="none" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#wave)"/>
        </svg>
        
        {/* Circles */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-blue-300/5 rounded-full blur-3xl"></div>
        
        {/* Dots pattern */}
        <svg className="absolute bottom-0 right-0 w-1/2 h-1/2 opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#1e40af"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)"/>
        </svg>
        
        {/* Plus signs */}
        <svg className="absolute top-1/4 left-1/4 w-64 h-64 opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="plus" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M15 5 L15 25 M5 15 L25 15" stroke="#1e40af" strokeWidth="2"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#plus)"/>
        </svg>
      </div>

      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Әкімші панелі
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">Мазмұнды басқару</p>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Link 
                href="/" 
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Басты бетке</span>
              </Link>
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-900">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  router.push('/login');
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Шығу</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative container mx-auto px-4 py-6 md:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-700">Тауарлар</h3>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              {products.length}
            </p>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-700">Санаттар</h3>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Tag className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              {categories.length}
            </p>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-700">Жалға алулар</h3>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Film className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              {rentals.length}
            </p>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-700">Жеңілдіктер</h3>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Gift className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              {discounts.length}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100">
          <div className="border-b border-blue-100 overflow-x-auto">
            <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 min-w-max">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-3 sm:py-4 px-2 border-b-2 font-semibold text-xs sm:text-sm transition whitespace-nowrap ${
                  activeTab === 'products'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-blue-600'
                }`}
              >
                Тауарлар ({products.length})
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`py-3 sm:py-4 px-2 border-b-2 font-semibold text-xs sm:text-sm transition whitespace-nowrap ${
                  activeTab === 'categories'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-blue-600'
                }`}
              >
                Санаттар ({categories.length})
              </button>
              <button
                onClick={() => setActiveTab('rentals')}
                className={`py-3 sm:py-4 px-2 border-b-2 font-semibold text-xs sm:text-sm transition whitespace-nowrap ${
                  activeTab === 'rentals'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-blue-600'
                }`}
              >
                Жалға алулар ({rentals.length})
              </button>
              <button
                onClick={() => setActiveTab('discounts')}
                className={`py-3 sm:py-4 px-2 border-b-2 font-semibold text-xs sm:text-sm transition whitespace-nowrap ${
                  activeTab === 'discounts'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-blue-600'
                }`}
              >
                Жеңілдіктер ({discounts.length})
              </button>
            </nav>
          </div>

          <div className="p-4 sm:p-6">
            {/* Products Tab */}
            {activeTab === 'products' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">Тауарларды басқару</h2>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      resetProductForm();
                      setShowProductModal(true);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 sm:px-4 py-2 rounded-xl flex items-center gap-2 hover:from-blue-700 hover:to-blue-800 transition shadow-lg hover:shadow-xl text-sm font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Тауар қосу</span>
                    <span className="sm:hidden">Қосу</span>
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-blue-100">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-blue-900">Сурет</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-blue-900">Атауы</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-blue-900 hidden md:table-cell">Санат</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-blue-900">Баға</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-blue-900 hidden lg:table-cell">Қойма</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-blue-900 hidden sm:table-cell">Мәртебе</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-blue-900">Әрекеттер</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {products.map((product) => (
                        <tr key={product.id} className="border-b border-blue-50 hover:bg-blue-50/50 transition">
                          <td className="py-3 px-4">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg shadow-sm" />
                            ) : (
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center shadow-sm">
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-sm text-gray-800">{product.name}</div>
                            <div className="text-xs text-gray-500 md:hidden">{product.category?.name}</div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 hidden md:table-cell">{product.category?.name || '-'}</td>
                          <td className="py-3 px-4 font-bold text-sm text-blue-600">{product.price} ₸</td>
                          <td className="py-3 px-4 text-sm hidden lg:table-cell">
                            <span className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {product.stock || 0} шт
                            </span>
                          </td>
                          <td className="py-3 px-4 hidden sm:table-cell">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              product.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {product.available ? 'Қолжетімді' : 'Қолжетімсіз'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditProduct(product)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
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
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">Санаттарды басқару</h2>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      resetCategoryForm();
                      setShowCategoryModal(true);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 sm:px-4 py-2 rounded-xl flex items-center gap-2 hover:from-blue-700 hover:to-blue-800 transition shadow-lg hover:shadow-xl text-sm font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Санат қосу</span>
                    <span className="sm:hidden">Қосу</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <div key={category.id} className="bg-white rounded-xl p-5 border border-blue-100 shadow-lg hover:shadow-xl hover:border-blue-200 transition-all duration-300">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg text-gray-800">{category.name}</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditCategory(category)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{category.description || 'Сипаттамасыз'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rentals Tab */}
            {activeTab === 'rentals' && (
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-6">Жалға алуларды басқару</h2>
                <div className="overflow-x-auto rounded-xl border border-blue-100">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-blue-900">ID</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-blue-900">Пайдаланушы</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-blue-900 hidden md:table-cell">Тауар</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-blue-900">Кезең</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-blue-900 hidden lg:table-cell">Төлем</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-blue-900">Мәртебе</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-blue-900">Әрекеттер</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {rentals.map((rental) => (
                        <tr key={rental.id} className="border-b border-blue-50 hover:bg-blue-50/50 transition">
                          <td className="py-3 px-4 font-bold text-sm text-gray-800">#{rental.id}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{rental.user?.email}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 hidden md:table-cell">{rental.product?.name}</td>
                          <td className="py-3 px-4 text-xs text-gray-600">
                            {new Date(rental.startDate).toLocaleDateString()} - {new Date(rental.endDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 hidden lg:table-cell">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              rental.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                              rental.paymentStatus === 'failed' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {rental.paymentStatus === 'paid' ? '✓ Төленді' : 
                               rental.paymentStatus === 'failed' ? '✗ Қате' : '⏳ Күтуде'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              rental.status === 'active' ? 'bg-green-100 text-green-700' :
                              rental.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {rental.status === 'active' ? '✓ Белсенді' : 
                               rental.status === 'completed' ? '✓ Аяқталды' : '⏳ Күту'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditRental(rental)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteRental(rental.id)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
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

            {/* Discounts Tab */}
            {activeTab === 'discounts' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">Жеңілдіктерді басқару</h2>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      resetDiscountForm();
                      setShowDiscountModal(true);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 sm:px-4 py-2 rounded-xl flex items-center gap-2 hover:from-blue-700 hover:to-blue-800 transition shadow-lg hover:shadow-xl text-sm font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Жеңілдік қосу</span>
                    <span className="sm:hidden">Қосу</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {discounts.map((discount) => (
                    <div key={discount.id} className="bg-white rounded-xl p-5 border border-blue-100 shadow-lg hover:shadow-xl hover:border-blue-200 transition-all duration-300">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">{discount.name}</h3>
                          <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                            {discount.value}%
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditDiscount(discount)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDiscount(discount.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        {discount.startDate && <p>С: {new Date(discount.startDate).toLocaleDateString()}</p>}
                        {discount.endDate && <p>До: {new Date(discount.endDate).toLocaleDateString()}</p>}
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          discount.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {discount.isActive ? 'Белсенді' : 'Белсенді емес'}
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-blue-100">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">
                {editingItem ? 'Тауарды өзгерту' : 'Тауар қосу'}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="text-white/80 hover:text-white transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Атауы</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Сипаттамасы</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Санат</label>
                <select
                  value={productForm.categoryId}
                  onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                >
                  <option value="">Санатты таңдаңыз</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-3">Жалға алу бағалары</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Күніне бағасы (₸) *</label>
                    <input
                      type="number"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Қоймадағы саны *</label>
                    <input
                      type="number"
                      min="0"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Тауар суреті</label>
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
                      <span className="text-sm text-gray-600">Сурет жүктеу</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG, WEBP до 5MB</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Сипаттамалары</label>
                <textarea
                  value={productForm.specifications}
                  onChange={(e) => setProductForm({ ...productForm, specifications: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  rows={2}
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
                <label htmlFor="available" className="ml-2 text-sm font-medium">Жалға алуға қолжетімді</label>
              </div>
            </div>

            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowProductModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
              >
                Болдырмау
              </button>
              <button
                onClick={editingItem ? handleUpdateProduct : handleCreateProduct}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 shadow-lg"
              >
                <Save className="w-4 h-4" />
                {editingItem ? 'Жаңарту' : 'Жасау'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-blue-100">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">
                {editingItem ? 'Санатты өзгерту' : 'Санат қосу'}
              </h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-white/80 hover:text-white transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Атауы</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Сипаттамасы</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Санат суреті</label>
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
                className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
              >
                Болдырмау
              </button>
              <button
                onClick={editingItem ? handleUpdateCategory : handleCreateCategory}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 shadow-lg"
              >
                <Save className="w-4 h-4" />
                {editingItem ? 'Жаңарту' : 'Жасау'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-blue-100">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">
                {editingItem ? 'Жеңілдікті өзгерту' : 'Жеңілдік қосу'}
              </h3>
              <button onClick={() => setShowDiscountModal(false)} className="text-white/80 hover:text-white transition">
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
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Жеңілдік пайызы</label>
                <input
                  type="number"
                  value={discountForm.percentage}
                  onChange={(e) => setDiscountForm({ ...discountForm, percentage: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  min="0"
                  max="100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Басталу күні</label>
                  <input
                    type="date"
                    value={discountForm.validFrom}
                    onChange={(e) => setDiscountForm({ ...discountForm, validFrom: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Аяқталу күні</label>
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
                <label htmlFor="active" className="ml-2 text-sm font-medium">Белсенді</label>
              </div>
            </div>

            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowDiscountModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
              >
                Болдырмау
              </button>
              <button
                onClick={editingItem ? handleUpdateDiscount : handleCreateDiscount}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 shadow-lg"
              >
                <Save className="w-4 h-4" />
                {editingItem ? 'Жаңарту' : 'Жасау'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rental Edit Modal */}
      {showRentalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-blue-100">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center sticky top-0 rounded-t-2xl">
              <h2 className="text-xl font-bold text-white">Жалға алуды өзгерту #{editingItem?.id}</h2>
              <button onClick={() => setShowRentalModal(false)} className="text-white/80 hover:text-white transition p-2 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Тауар:</strong> {editingItem?.product?.name}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Клиент:</strong> {editingItem?.user?.email}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Кезең:</strong> {new Date(editingItem?.startDate).toLocaleDateString()} - {new Date(editingItem?.endDate).toLocaleDateString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Жалға алу мәртебесі</label>
                <select
                  value={rentalForm.status}
                  onChange={(e) => setRentalForm({ ...rentalForm, status: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                >
                  <option value="pending">⏳ Күту</option>
                  <option value="active">✓ Белсенді</option>
                  <option value="completed">✓ Аяқталды</option>
                  <option value="cancelled">✗ Болдырылды</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Төлем мәртебесі</label>
                <select
                  value={rentalForm.paymentStatus}
                  onChange={(e) => setRentalForm({ ...rentalForm, paymentStatus: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                >
                  <option value="pending">💰 Төлемді күтуде</option>
                  <option value="paid">✓ Төленді</option>
                  <option value="failed">✗ Төлем қатесі</option>
                </select>
              </div>
            </div>

            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowRentalModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
              >
                Болдырмау
              </button>
              <button
                onClick={handleUpdateRental}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 shadow-lg"
              >
                <Save className="w-4 h-4" />
                Сақтау
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        confirmText="Жою"
        cancelText="Болдырмау"
        type={confirmDialog.type}
      />

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
