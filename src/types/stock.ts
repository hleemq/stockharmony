export interface StockItem {
  stockCode: string;
  productName: string;
  boxDetails: string;
  unit: string;
  shipmentFees: number;
  boughtPrice: number;
  initialPrice: number;
  sellingPrice: number;
  discount: string;
  location: string;
  imageUrl?: string;
}