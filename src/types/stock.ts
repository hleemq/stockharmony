export interface StockItem {
  id: string;
  stockCode: string;
  productName: string;
  boxes: number;
  unitsPerBox: number;
  shipmentFees: number;
  boughtPrice: number;
  initialPrice: number;
  sellingPrice: number;
  price: number;
  location: string;
  imageUrl?: string;
  stockAvailable: number;
  quantity_per_box: number;
}

export interface OrderProduct extends StockItem {
  orderQuantity: number;
  discountPercentage: number;
  applyDiscount: boolean;
}