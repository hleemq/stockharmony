import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { OrderProduct } from '@/types/stock';

interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${year}${month}-${random}`;
};

export const generateOrderPDF = async (
  customerDetails: CustomerDetails,
  products: (OrderProduct & { boxes: number; units: number })[],
  orderNumber: string
): Promise<Blob> => {
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

  // Order Number and Date
  doc.setFontSize(12);
  doc.text(`Order Number: ${orderNumber}`, 15, 30);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 37);

  // Customer Details
  doc.setFont('helvetica', 'normal');
  doc.text(`Customer Name: ${customerDetails.name}`, 15, 47);
  doc.text(`Address: ${customerDetails.address}`, 15, 54);
  doc.text(`Phone: ${customerDetails.phone}`, 15, 61);
  doc.text(`Email: ${customerDetails.email}`, 15, 68);

  // Calculate table data
  const tableData = products.map(product => {
    const basePrice = product.sellingPrice * product.orderQuantity;
    const discountAmount = product.applyDiscount ? (basePrice * product.discountPercentage / 100) : 0;
    const finalPrice = basePrice - discountAmount;

    return [
      product.stockCode,
      product.productName,
      product.boxes.toString(),
      product.units.toString(),
      product.orderQuantity.toString(),
      `$${product.sellingPrice.toFixed(2)}`,
      product.applyDiscount ? `${product.discountPercentage}%` : '-',
      `$${finalPrice.toFixed(2)}`
    ];
  });

  // Calculate total
  const total = products.reduce((sum, product) => {
    const basePrice = product.sellingPrice * product.orderQuantity;
    const discountAmount = product.applyDiscount ? (basePrice * product.discountPercentage / 100) : 0;
    return sum + (basePrice - discountAmount);
  }, 0);

  // Add table
  autoTable(doc, {
    head: [[
      'Stock Code',
      'Product Name',
      'Boxes',
      'Units',
      'Total Quantity',
      'Price',
      'Discount',
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

  // Return as Blob instead of saving
  return new Blob([doc.output('blob')], { type: 'application/pdf' });
};
