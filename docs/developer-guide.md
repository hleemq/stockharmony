# Developer Guide

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components and routes
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── lib/          # Third-party library configurations
```

## Key Components

### OrderSummary
Displays order details and calculates totals.
```typescript
interface OrderSummaryProps {
  products: (StockItem & { 
    orderQuantity: number;
    applyDiscount: boolean;
  })[];
  onRemoveProduct: (stockCode: string) => void;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
}
```

### ProductSearchResults
Handles product search and selection.
```typescript
interface ProductSearchResultsProps {
  searchQuery: string;
  onAddToOrder: (product: StockItem, quantity: number, applyDiscount: boolean) => void;
  selectedProducts: (StockItem & { orderQuantity: number; applyDiscount: boolean })[];
}
```

## State Management

The application uses React's built-in state management with hooks:
- useState for local component state
- Custom hooks for shared logic

## PDF Generation

Uses jsPDF for generating order documents:
```typescript
generateOrderPDF(customerDetails, products, orderNumber)
```

## Build and Deploy

1. Development:
```bash
npm run dev
```

2. Production Build:
```bash
npm run build
```

3. Preview Production Build:
```bash
npm run preview
```