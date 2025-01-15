export interface StockItem {
  id: string; // Adding id field
  stockCode: string;
  productName: string;
  boxes: number;
  unitsPerBox: number;
  shipmentFees: number;
  boughtPrice: number;
  initialPrice: number;
  sellingPrice: number;
  location: string;
  imageUrl?: string;
  stockAvailable: number;
}

export interface OrderProduct extends StockItem {
  orderQuantity: number;
  discountPercentage: number;
  applyDiscount: boolean;
}