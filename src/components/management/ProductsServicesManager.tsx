import { PencilIcon, PlusIcon, SearchIcon, TrashIcon } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Badge } from '../common/Badge';
import Button from '../common/Button';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import Modal from '../common/Modal';
import Select from '../common/Select';

// Types
type ProductStatus = 'active' | 'inactive' | 'draft';
type BusinessType = 'all' | 'lender' | 'borrower' | 'broker' | 'vendor';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  status: ProductStatus;
  businessType: BusinessType[];
  createdAt: string;
}

// Mock Data
const mockProducts: Product[] = [
  {
    id: 'prod-001',
    name: 'Standard Loan Package',
    description: 'Basic loan processing service.',
    price: 500,
    status: 'active',
    businessType: ['borrower'],
    createdAt: '2023-01-15T10:00:00Z',
  },
  {
    id: 'prod-002',
    name: 'Premium Underwriting',
    description: 'In-depth underwriting and risk analysis.',
    price: 2500,
    status: 'active',
    businessType: ['lender'],
    createdAt: '2023-02-20T14:30:00Z',
  },
  {
    id: 'prod-003',
    name: 'Broker Partnership Fee',
    description: 'Annual fee for brokerage partners.',
    price: 1000,
    status: 'active',
    businessType: ['broker'],
    createdAt: '2023-03-10T11:00:00Z',
  },
  {
    id: 'prod-004',
    name: 'Compliance Audit Service',
    description: 'SOC 2 and financial compliance audit.',
    price: 5000,
    status: 'inactive',
    businessType: ['lender', 'borrower'],
    createdAt: '2023-04-05T16:45:00Z',
  },
  {
    id: 'prod-005',
    name: 'Document Verification API',
    description: 'API access for document verification.',
    price: 1500,
    status: 'draft',
    businessType: ['vendor'],
    createdAt: '2023-05-21T09:20:00Z',
  },
];

const ProductsServicesManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBusinessType, setFilterBusinessType] = useState<BusinessType>('all');

  const openModal = (product: Product | null = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingProduct(null);
    setIsModalOpen(false);
  };

  const handleSave = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    if (editingProduct) {
      // Update existing product
      setProducts(
        products.map(p => (p.id === editingProduct.id ? { ...editingProduct, ...productData } : p)),
      );
    } else {
      // Add new product
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...productData,
      };
      setProducts([...products, newProduct]);
    }
    closeModal();
  };

  const handleDelete = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== productId));
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType =
        filterBusinessType === 'all' || product.businessType.includes(filterBusinessType);
      return matchesSearch && matchesType;
    });
  }, [products, searchTerm, filterBusinessType]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="mb-2 text-3xl font-bold text-gray-800">Products & Services Management</h1>
      <p className="mb-6 text-gray-600">
        Create, manage, and assign products and services to different customer types.
      </p>

      <Card className="p-4">
        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-[200px] flex-1 items-center gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search products..."
                className="pl-10"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={filterBusinessType}
              onChange={(value) => setFilterBusinessType(value as BusinessType)}
              options={[
                { value: 'all', label: 'All Business Types' },
                { value: 'lender', label: 'Lender' },
                { value: 'borrower', label: 'Borrower' },
                { value: 'broker', label: 'Broker' },
                { value: 'vendor', label: 'Vendor' }
              ]}
            />
          </div>
          <Button onClick={() => openModal()}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Product/Service
          </Button>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-100 text-xs uppercase text-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Product Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Business Type(s)
                </th>
                <th scope="col" className="px-6 py-3">
                  Price
                </th>
                <th scope="col" className="px-6 py-3">
                  Status
                </th>
                <th scope="col" className="px-6 py-3">
                  Created At
                </th>
                <th scope="col" className="px-6 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id} className="border-b bg-white hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {product.name}
                    <p className="mt-1 text-xs font-normal text-gray-500">{product.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {product.businessType.map(bt => (
                        <Badge key={bt} variant="secondary" className="capitalize">
                          {bt}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">${product.price.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={product.status === 'active' ? 'success' : 'warning'}
                      className="capitalize"
                    >
                      {product.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">{new Date(product.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="small" onClick={() => openModal(product)}>
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="danger"
                        size="small"
                        onClick={() => handleDelete(product.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {isModalOpen && (
        <ProductFormModal product={editingProduct} onClose={closeModal} onSave={handleSave} />
      )}
    </div>
  );
};

// Sub-component for the Product Form
interface ProductFormModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: (productData: Omit<Product, 'id' | 'createdAt'>) => void;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    status: product?.status || 'draft',
    businessType: product?.businessType || [],
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiSelectChange = (field: string, value: string) => {
    const currentValues = formData[field as keyof typeof formData] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    setFormData(prev => ({ ...prev, [field]: newValues }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const businessTypeOptions: BusinessType[] = ['lender', 'borrower', 'broker', 'vendor'];

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={product ? 'Edit Product/Service' : 'Add Product/Service'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <Input
            value={formData.name}
            onChange={e => handleInputChange('name', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <Input
            value={formData.description}
            onChange={e => handleInputChange('description', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Price</label>
          <Input
            type="number"
            value={formData.price}
            onChange={e => handleInputChange('price', parseFloat(e.target.value))}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <Select
            value={formData.status}
            onChange={(value) => handleInputChange('status', value)}
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Applicable Business Type(s)
          </label>
          <div className="flex flex-wrap gap-2">
            {businessTypeOptions.map(type => (
              <label key={type} className="flex cursor-pointer items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.businessType.includes(type)}
                  onChange={() => handleMultiSelectChange('businessType', type)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductsServicesManager;
