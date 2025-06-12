# EVA Platform API Integration Guide

This guide explains the architecture and usage patterns for the API integration layer in the EVA Platform frontend.

## Architecture Overview

Our API integration is structured in layers:

1. **Environment Configuration**: Environment-specific settings like API URLs and timeouts
2. **API Client**: Core HTTP client with error handling, retries, and authentication
3. **Base Service**: Abstract class providing CRUD operations for domain entities
4. **Domain Services**: Specific services for each domain area (users, transactions, etc.)
5. **Data Validation**: Schema-based validation using Zod
6. **React Integration**: Hooks and providers for React components

## Using API Services

### Basic Usage

```tsx
import userProfileService from '../api/services/userProfileService';
import { useApiQuery } from '../hooks/useApi';

function UserProfile() {
  // Using React Query hooks
  const { data, isLoading, error } = useApiQuery(
    'userProfile',
    () => userProfileService.getCurrentUserProfile()
  );
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.email}</p>
    </div>
  );
}
```

### Creating a New Domain Service

1. Define your entity schema using Zod:

```ts
import { z } from 'zod';
import { CommonSchemas } from '../validation';

export const ProductSchema = z.object({
  id: CommonSchemas.id,
  name: z.string().min(2),
  price: z.number().positive(),
  category: z.string(),
  createdAt: CommonSchemas.dateString,
  updatedAt: CommonSchemas.dateString,
});

export type Product = z.infer<typeof ProductSchema>;
```

2. Create a service extending BaseService:

```ts
import { BaseService } from '../BaseService';
import { ProductSchema, Product } from './schemas';

class ProductService extends BaseService<Product> {
  constructor() {
    super('/products', 'Product', ProductSchema);
  }
  
  // Add custom methods as needed
  async getTopProducts(limit: number = 5): Promise<ApiResponse<Product[]>> {
    return this.client.get<Product[]>(`${this.baseUrl}/top`, { limit });
  }
}

export default new ProductService();
```

3. Use the service in components:

```tsx
import productService from '../api/services/productService';
import { useApiQuery, useApiMutation } from '../hooks/useApi';

function ProductList() {
  const { data: products } = useApiQuery(
    'products', 
    () => productService.getAll()
  );
  
  const createMutation = useApiMutation(
    (newProduct) => productService.create(newProduct),
    {
      onSuccess: () => {
        // Invalidate queries to refetch data
        invalidateQueries('products');
      }
    }
  );
  
  const handleCreate = () => {
    createMutation.mutate({
      name: 'New Product',
      price: 99.99,
      category: 'Electronics'
    });
  };
  
  // Component rendering...
}
```

## Error Handling

We provide several error types:

- `ApiError`: Base error class for API-related errors
- `NetworkError`: For connectivity issues
- `AuthenticationError`: For authentication/authorization failures

Use our error boundary component for graceful error handling:

```tsx
import ErrorBoundary from '../components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

## Mock Mode

Services support a mock mode for development, testing, and demoing:

- Controlled via `demoModeService.isEnabled()`
- Each service can provide mock data
- Simulated delays for realistic testing

## Data Validation

We use Zod for schema validation:

- Define entity schemas in domain services
- Validation occurs on create/update operations
- Custom error messages and handling

## Best Practices

1. **Use the service pattern**: Create domain-specific services
2. **Leverage React Query**: Use `useApiQuery` and `useApiMutation` hooks
3. **Handle errors properly**: Use error boundaries and check error states
4. **Validate data**: Define Zod schemas for all entities
5. **Centralize authentication**: Use the auth service for login/logout
6. **Test with mock mode**: Develop UI without a backend

## API Service Directory Structure

```
src/api/
├── apiClient.ts             # Core HTTP client
├── BaseService.ts           # Abstract base service
├── validation.ts            # Validation utilities
├── authService.ts           # Authentication service
├── demoModeService.ts       # Mock mode configuration
├── services/                # Domain-specific services
│   ├── userProfileService.ts
│   └── ...
└── mockData/                # Mock data for testing
    └── ...
```

## Environment Configuration

API endpoints and other settings are configured in `src/config/environment.ts` with support for development, staging, and production environments. 