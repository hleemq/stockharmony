import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { StockItem } from '@/types/stock';
import { Order, OrderItem } from '@/types/order';

interface CustomerDetails {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface OrderProduct extends StockItem {
  orderQuantity: number;
  applyDiscount: boolean;
}

export const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${year}${month}-${random}`;
};

export const generateOrderPDF = (
  customerDetails: CustomerDetails, 
  products: OrderProduct[],
  orderNumber: string
): Order => {
  const doc = new jsPDF();
  const orderDate = new Date().toISOString();
  
  // Set document properties
  doc.setProperties({
    title: 'Order Form',
    subject: 'Order Details',
    creator: 'Your Company Name'
  });

  // Header Section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('ORDER FORM', doc.internal.pageSize.width / 2, 20, { align: 'center' });

  // Order Number
  doc.setFontSize(12);
  doc.text(`Order Number: ${orderNumber}`, 15, 30);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 37);

  // Customer Details
  doc.setFont('helvetica', 'normal');
  doc.text(`Customer Name: ${customerDetails.name}`, 15, 47);
  doc.text(`Address: ${customerDetails.address || 'N/A'}`, 15, 54);
  doc.text(`Phone: ${customerDetails.phone || 'N/A'}`, 15, 61);
  doc.text(`Email: ${customerDetails.email || 'N/A'}`, 15, 68);

  // Calculate table data
  const tableData = products.map(product => {
    const boxes = Math.floor(product.orderQuantity / product.unitsPerBox);
    const units = product.orderQuantity % product.unitsPerBox;
    const basePrice = product.sellingPrice * product.orderQuantity;
    const discount = product.applyDiscount ? (parseFloat(product.discount) || 0) : 0;
    const priceWithDiscount = basePrice - (basePrice * discount / 100);

    return [
      product.stockCode,
      product.productName,
      boxes.toString(),
      units.toString(),
      `$${product.sellingPrice.toFixed(2)}`,
      product.applyDiscount ? `${product.discount}%` : '-',
      `$${priceWithDiscount.toFixed(2)}`,
      `$${priceWithDiscount.toFixed(2)}`
    ];
  });

  // Calculate total
  const total = products.reduce((sum, product) => {
    const basePrice = product.sellingPrice * product.orderQuantity;
    const discount = product.applyDiscount ? (parseFloat(product.discount) || 0) : 0;
    return sum + (basePrice - (basePrice * discount / 100));
  }, 0);

  // Add table
  autoTable(doc, {
    head: [[
      'Stock Code',
      'Product Name',
      'Boxes',
      'Units',
      'Price',
      'Discount',
      'Price with Discount',
      'Total'
    ]],
    body: tableData,
    foot: [[
      { content: 'Total Amount:', colSpan: 7, styles: { halign: 'right', fontStyle: 'bold' } },
      { content: `$${total.toFixed(2)}`, styles: { fontStyle: 'bold' } }
    ]],
    startY: 75,
    margin: { left: 15, right: 15 },
    headStyles: { fillColor: [51, 51, 51], fontSize: 12, fontStyle: 'bold' },
    bodyStyles: { fontSize: 10 },
    footStyles: { fontSize: 12 },
    theme: 'grid'
  });

  // Footer message
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(12);
  doc.text('ENJOY OUR PRODUCTS...', doc.internal.pageSize.width / 2, pageHeight - 20, { align: 'center' });

  // Save the PDF with order number in filename
  doc.save(`${orderNumber}.pdf`);

  // Create and return order object
  const orderItems: OrderItem[] = products.map(product => ({
    id: product.stockCode,
    productName: product.productName,
    quantity: product.orderQuantity,
    price: product.sellingPrice,
    total: product.sellingPrice * product.orderQuantity * (1 - (product.applyDiscount ? parseFloat(product.discount) / 100 : 0))
  }));

  return {
    id: orderNumber,
    orderNumber,
    customerName: customerDetails.name,
    orderDate,
    status: 'pending',
    items: orderItems,
    totalAmount: total
  };
};