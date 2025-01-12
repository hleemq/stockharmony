export interface StockItem {
  stockCode: string;
  productName: string;
  boxes: number;
  unitsPerBox: number;
  shipmentFees: number;
  boughtPrice: number;
  initialPrice: number;
  sellingPrice: number;
  discount: string;
  location: string;
  imageUrl?: string;
  stockAvailable: number;
}