# Creating an Order - Example

This example demonstrates how to create a new order in the system.

## Step 1: Open Create Order Dialog

```typescript
// Click the "New Order" button to open the dialog
<Button onClick={() => setDialogOpen(true)}>
  New Order
</Button>
```

## Step 2: Fill Customer Details

```typescript
// Example customer details
const customerDetails = {
  name: "John Doe",
  email: "john@example.com",
  phone: "123-456-7890",
  address: "123 Main St"
};
```

## Step 3: Add Products

```typescript
// Example product selection
const product = {
  stockCode: "PRD001",
  quantity: 5,
  applyDiscount: true
};
```

## Step 4: Generate Order

```typescript
// Example order generation
const orderNumber = generateOrderNumber();
const order = generateOrderPDF(customerDetails, selectedProducts, orderNumber);
```

See the [User Guide](../user-guide.md) for more detailed instructions.