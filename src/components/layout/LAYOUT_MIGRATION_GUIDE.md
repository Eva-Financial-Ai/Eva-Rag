# Layout System Migration Guide

## Overview

This guide will help you migrate from the current inconsistent layout implementations to the new unified layout system.

## New Layout Components

### 1. UniversalLayout

The main layout wrapper that provides consistent structure across all pages.

```tsx
import UniversalLayout from './UniversalLayout';

// Basic usage
<UniversalLayout title="Page Title">
  {/* Your page content */}
</UniversalLayout>

// With all options
<UniversalLayout
  title="Page Title"
  subtitle="Optional subtitle"
  showBackButton={true}
  backPath="/dashboard"
  breadcrumbs={[
    { label: 'Home', path: '/' },
    { label: 'Section', path: '/section' },
    { label: 'Current Page' }
  ]}
  headerActions={
    <button className="btn btn-primary">Action</button>
  }
  fullWidth={false} // Set to true for full-width pages
  noPadding={false} // Set to true to remove default padding
>
  {/* Your page content */}
</UniversalLayout>
```

### 2. Grid System

Flexible 12-column grid with responsive breakpoints.

```tsx
import { Grid, GridItem } from './GridSystem';

// Basic grid
<Grid cols={{ default: 1, sm: 2, md: 3, lg: 4 }} gap="md">
  <GridItem>Content 1</GridItem>
  <GridItem>Content 2</GridItem>
  <GridItem>Content 3</GridItem>
  <GridItem>Content 4</GridItem>
</Grid>

// Advanced grid with custom spans
<Grid cols={{ default: 12 }} gap="lg">
  <GridItem span={{ default: 12, md: 8, lg: 9 }}>
    Main content
  </GridItem>
  <GridItem span={{ default: 12, md: 4, lg: 3 }}>
    Sidebar
  </GridItem>
</Grid>
```

### 3. ConsistentCard

Standardized card component for consistent UI.

```tsx
import ConsistentCard, { CardGrid } from './ConsistentCard';

// Single card
<ConsistentCard
  title="Card Title"
  subtitle="Optional subtitle"
  headerActions={<button>Edit</button>}
  footer={<div>Card footer</div>}
  padding="md"
  shadow="sm"
  hover={true}
>
  Card content
</ConsistentCard>

// Card grid
<CardGrid columns={{ default: 1, sm: 2, md: 3 }} gap="md">
  <ConsistentCard title="Card 1">Content 1</ConsistentCard>
  <ConsistentCard title="Card 2">Content 2</ConsistentCard>
  <ConsistentCard title="Card 3">Content 3</ConsistentCard>
</CardGrid>
```

### 4. Layout Utilities

Helper components for common layout patterns.

```tsx
import { Container, Stack, Row } from './GridSystem';

// Container with max-width
<Container size="xl">
  <h1>Page content</h1>
</Container>

// Vertical stack
<Stack spacing="md">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Stack>

// Horizontal row
<Row spacing="lg" justify="between" align="center">
  <div>Left content</div>
  <div>Right content</div>
</Row>
```

## Migration Steps

### Step 1: Update Imports

Add the new layout system CSS to your main styles:

```css
/* In src/styles/index.css or equivalent */
@import './layout-system.css';
```

### Step 2: Wrap App with LayoutProvider

In your main App component:

```tsx
import { LayoutProvider } from '../../contexts/LayoutContext';

function App() {
  return <LayoutProvider>{/* Your existing app content */}</LayoutProvider>;
}
```

### Step 3: Replace PageLayout/MainLayout

Replace existing layout components with UniversalLayout:

**Before:**

```tsx
<PageLayout title="Contacts" showBackButton={true} backPath="/customers">
  {/* Page content */}
</PageLayout>
```

**After:**

```tsx
<UniversalLayout
  title="Contacts"
  showBackButton={true}
  backPath="/customers"
  breadcrumbs={[{ label: 'Customers', path: '/customers' }, { label: 'Contacts' }]}
>
  {/* Page content */}
</UniversalLayout>
```

### Step 4: Update Card Components

Replace custom card implementations with ConsistentCard:

**Before:**

```tsx
<div className="bg-white rounded-lg shadow p-6">
  <h3 className="text-lg font-semibold mb-4">Card Title</h3>
  <div>Card content</div>
</div>
```

**After:**

```tsx
<ConsistentCard title="Card Title" padding="md" shadow="sm">
  Card content
</ConsistentCard>
```

### Step 5: Implement Grid System

Replace custom grid layouts with the new grid system:

**Before:**

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

**After:**

```tsx
<Grid cols={{ default: 1, md: 3 }} gap="md">
  <GridItem>Item 1</GridItem>
  <GridItem>Item 2</GridItem>
  <GridItem>Item 3</GridItem>
</Grid>
```

## Common Patterns

### Dashboard Layout

```tsx
<UniversalLayout title="Dashboard">
  <Stack spacing="lg">
    {/* Stats Cards */}
    <CardGrid columns={{ default: 1, sm: 2, lg: 4 }} gap="md">
      <ConsistentCard title="Total Users" hover>
        <div className="text-3xl font-bold">1,234</div>
      </ConsistentCard>
      {/* More stat cards */}
    </CardGrid>

    {/* Main Content Grid */}
    <Grid cols={{ default: 12 }} gap="lg">
      <GridItem span={{ default: 12, lg: 8 }}>
        <ConsistentCard title="Recent Activity">{/* Activity content */}</ConsistentCard>
      </GridItem>
      <GridItem span={{ default: 12, lg: 4 }}>
        <ConsistentCard title="Quick Actions">{/* Actions content */}</ConsistentCard>
      </GridItem>
    </Grid>
  </Stack>
</UniversalLayout>
```

### Form Layout

```tsx
<UniversalLayout title="Edit Profile" showBackButton backPath="/profile">
  <Container size="md">
    <ConsistentCard>
      <form>
        <Stack spacing="md">
          <div>
            <label className="form-label">Name</label>
            <input className="form-input" />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input className="form-input" type="email" />
          </div>
          <Row justify="end" spacing="sm">
            <button type="button" className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </Row>
        </Stack>
      </form>
    </ConsistentCard>
  </Container>
</UniversalLayout>
```

### List/Table Layout

```tsx
<UniversalLayout title="Customers">
  <Stack spacing="md">
    {/* Filters */}
    <ConsistentCard padding="sm">
      <Row spacing="md" wrap>
        <input placeholder="Search..." className="form-input" />
        <select className="form-select">
          <option>All Status</option>
        </select>
        <button className="btn btn-primary">Filter</button>
      </Row>
    </ConsistentCard>

    {/* Table */}
    <ConsistentCard padding="none">
      <table className="w-full">{/* Table content */}</table>
    </ConsistentCard>
  </Stack>
</UniversalLayout>
```

## Best Practices

1. **Always use UniversalLayout** as the top-level wrapper for pages
2. **Use the Grid system** instead of custom flexbox/grid implementations
3. **Use ConsistentCard** for all card-like UI elements
4. **Follow the spacing scale** (xs, sm, md, lg, xl, 2xl)
5. **Set appropriate breadcrumbs** for better navigation
6. **Use Container** to limit content width on large screens
7. **Leverage Stack and Row** for simple layouts

## Troubleshooting

### Issue: Layout looks different after migration

- Check that you've imported the layout-system.css file
- Ensure you're using the correct spacing props
- Verify that the LayoutProvider is wrapping your app

### Issue: Cards have inconsistent spacing

- Use ConsistentCard with the same padding prop
- Use CardGrid for automatic spacing between cards

### Issue: Content is too wide on large screens

- Wrap content in Container component
- Use fullWidth={false} on UniversalLayout (default)

### Issue: Grid items not aligning properly

- Ensure all items are wrapped in GridItem
- Check responsive span configurations

## Support

For questions or issues with the migration, please:

1. Check this guide first
2. Review the component documentation
3. Ask in the #frontend channel
4. Create an issue with the `layout-system` tag
