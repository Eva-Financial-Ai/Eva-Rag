import {
  CheckCircleIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  LightBulbIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  SparklesIcon,
  TagIcon,
  TrashIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useState } from 'react';
import { useApi } from '../../contexts/ApiContext';
import { useAuth } from '../../hooks/useAuth';
import { naicsIndustries } from '../../utils/naicsData';
import {
  getMultipleNAICSSuggestions,
  getProductServiceSuggestions,
  ProductServiceSuggestion,
  searchProductServiceSuggestions,
} from '../../utils/naicsProductsServices';
import Button from '../common/Button';
import Modal from '../common/Modal';
import NAICSSelector from '../NAICSSelector';

interface Product {
  id: string;
  name: string;
  description: string;
  category: 'product' | 'service';
  price: number;
  priceType: 'fixed' | 'variable' | 'quote';
  status: 'active' | 'inactive';
  customerId: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  specifications?: Record<string, any>;
}

interface ProductFormData {
  name: string;
  description: string;
  category: 'product' | 'service';
  price: number;
  priceType: 'fixed' | 'variable' | 'quote';
  status: 'active' | 'inactive';
  tags: string[];
  specifications: Record<string, any>;
}

const ProductsServices: React.FC = () => {
  const { user } = useAuth();
  const { apiClient } = useApi();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'product' | 'service'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const initialFormData: ProductFormData = {
    name: '',
    description: '',
    category: 'product',
    price: 0,
    priceType: 'fixed',
    status: 'active',
    tags: [],
    specifications: {},
  };

  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [tagInput, setTagInput] = useState('');
  const [showNAICSModal, setShowNAICSModal] = useState(false);
  const [selectedNAICS, setSelectedNAICS] = useState<string[]>([]);
  const [naicsSuggestions, setNaicsSuggestions] = useState<ProductServiceSuggestion[]>([]);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<Product[]>('/api/products-services', {
        params: { customerId: user?.id },
      });
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Mock data for demo
      setProducts([
        {
          id: '1',
          name: 'Business Loan Service',
          description: 'Comprehensive business loan consultation and processing',
          category: 'service',
          price: 500,
          priceType: 'fixed',
          status: 'active',
          customerId: user?.id || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ['consulting', 'finance'],
        },
        {
          id: '2',
          name: 'Equipment Financing',
          description: 'Equipment purchase and lease financing solutions',
          category: 'product',
          price: 0,
          priceType: 'quote',
          status: 'active',
          customerId: user?.id || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ['equipment', 'leasing'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [apiClient, user?.id]);

  const applyFilters = useCallback(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      );
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(product => product.category === filterCategory);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(product => product.status === filterStatus);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, filterCategory, filterStatus]);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Apply filters whenever search term or filters change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleAddNew = () => {
    setEditingProduct(null);
    setFormData(initialFormData);
    setTagInput('');
    setShowModal(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      priceType: product.priceType,
      status: product.status,
      tags: product.tags || [],
      specifications: product.specifications || {},
    });
    setTagInput('');
    setShowModal(true);
  };

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await apiClient.delete(`/api/products-services/${productToDelete.id}`);
      setProducts(products.filter(p => p.id !== productToDelete.id));
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      // For demo, just remove from local state
      setProducts(products.filter(p => p.id !== productToDelete.id));
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        customerId: user?.id,
      };

      if (editingProduct) {
        // Update existing product
        const response = await apiClient.put(
          `/api/products-services/${editingProduct.id}`,
          payload,
        );
        setProducts(
          products.map(p =>
            p.id === editingProduct.id
              ? { ...p, ...payload, updatedAt: new Date().toISOString() }
              : p,
          ),
        );
      } else {
        // Create new product
        const response = await apiClient.post('/api/products-services', payload);
        const newProduct: Product = {
          id: Date.now().toString(),
          ...payload,
          customerId: user?.id || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setProducts([...products, newProduct]);
      }

      setShowModal(false);
      setFormData(initialFormData);
    } catch (error) {
      console.error('Error saving product:', error);
      // For demo, still update local state
      if (editingProduct) {
        setProducts(
          products.map(p =>
            p.id === editingProduct.id
              ? { ...p, ...formData, updatedAt: new Date().toISOString() }
              : p,
          ),
        );
      } else {
        const newProduct: Product = {
          id: Date.now().toString(),
          ...formData,
          customerId: user?.id || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setProducts([...products, newProduct]);
      }
      setShowModal(false);
      setFormData(initialFormData);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove),
    });
  };

  const handleNAICSSelection = (naicsCodes: string[]) => {
    setSelectedNAICS(naicsCodes);
    const suggestions = getMultipleNAICSSuggestions(naicsCodes);
    setNaicsSuggestions(suggestions);
    setShowNAICSModal(false);
    if (suggestions.length > 0) {
      setShowSuggestionsModal(true);
    }
  };

  const handleUseSuggestion = (suggestion: ProductServiceSuggestion) => {
    setFormData({
      ...formData,
      name: suggestion.name,
      description: suggestion.description,
      category: suggestion.category,
      priceType: suggestion.priceType,
      tags: suggestion.tags,
    });
    setShowSuggestionsModal(false);
  };

  const handleSearchSuggestions = (keyword: string) => {
    if (keyword.length >= 2) {
      const suggestions = searchProductServiceSuggestions(keyword);
      setNaicsSuggestions(suggestions);
    }
  };

  const getPriceDisplay = (product: Product) => {
    switch (product.priceType) {
      case 'fixed':
        return `$${product.price.toFixed(2)}`;
      case 'variable':
        return `Starting at $${product.price.toFixed(2)}`;
      case 'quote':
        return 'Quote on Request';
      default:
        return 'N/A';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products & Services</h1>
          <p className="mt-1 text-gray-600">Manage your offerings to vendors and borrowers</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowNAICSModal(true)}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
            leftIcon={<SparklesIcon className="h-5 w-5" />}
          >
            Get NAICS Suggestions
          </Button>
          <Button
            onClick={handleAddNew}
            className="bg-blue-600 text-white hover:bg-blue-700"
            leftIcon={<PlusIcon className="h-5 w-5" />}
          >
            Add New
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search products & services..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value as any)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="product">Products</option>
            <option value="service">Services</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Results Count */}
          <div className="flex items-center text-sm text-gray-600">
            Showing {filteredProducts.length} of {products.length} items
          </div>
        </div>
      </div>

      {/* Products/Services Grid */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <DocumentTextIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">No products or services found</h3>
          <p className="text-gray-600">
            {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by adding your first product or service'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="rounded-lg bg-white shadow transition-shadow hover:shadow-lg"
            >
              <div className="p-6">
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center">
                    {product.category === 'product' ? (
                      <TagIcon className="mr-2 h-5 w-5 text-blue-600" />
                    ) : (
                      <CurrencyDollarIcon className="mr-2 h-5 w-5 text-green-600" />
                    )}
                    <span className="text-xs font-medium uppercase text-gray-500">
                      {product.category}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      product.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {product.status === 'active' ? (
                      <CheckCircleIcon className="mr-1 h-3 w-3" />
                    ) : (
                      <XCircleIcon className="mr-1 h-3 w-3" />
                    )}
                    {product.status}
                  </span>
                </div>

                {/* Content */}
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{product.name}</h3>
                <p className="mb-4 line-clamp-2 text-sm text-gray-600">{product.description}</p>

                {/* Price */}
                <div className="mb-4 text-lg font-bold text-gray-900">
                  {getPriceDisplay(product)}
                </div>

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {product.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-2 border-t border-gray-200 pt-4">
                  <button
                    onClick={() => handleEdit(product)}
                    className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    title="Edit"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
                    title="Delete"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingProduct ? 'Edit Product/Service' : 'Add New Product/Service'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description *</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Category *</label>
            <select
              required
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value as any })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              <option value="product">Product</option>
              <option value="service">Service</option>
            </select>
          </div>

          {/* Price Type and Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Pricing Type *</label>
              <select
                required
                value={formData.priceType}
                onChange={e => setFormData({ ...formData, priceType: e.target.value as any })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              >
                <option value="fixed">Fixed Price</option>
                <option value="variable">Variable Price</option>
                <option value="quote">Quote on Request</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {formData.priceType === 'variable' ? 'Starting Price' : 'Price'}{' '}
                {formData.priceType !== 'quote' && '*'}
              </label>
              <input
                type="number"
                step="0.01"
                required={formData.priceType !== 'quote'}
                disabled={formData.priceType === 'quote'}
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Status *</label>
            <select
              required
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Tags</label>
            <div className="mb-2 flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add a tag..."
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
              <Button
                type="button"
                onClick={handleAddTag}
                className="bg-gray-600 text-white hover:bg-gray-700"
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              onClick={() => setShowModal(false)}
              className="bg-gray-300 text-gray-700 hover:bg-gray-400"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
              {editingProduct ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Product/Service"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{productToDelete?.name}</strong>? This action
            cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              onClick={() => setShowDeleteConfirm(false)}
              className="bg-gray-300 text-gray-700 hover:bg-gray-400"
            >
              Cancel
            </Button>
            <Button onClick={confirmDelete} className="bg-red-600 text-white hover:bg-red-700">
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductsServices;
