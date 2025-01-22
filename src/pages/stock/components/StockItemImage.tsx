import { ImageIcon } from "lucide-react";

interface StockItemImageProps {
  imageUrl?: string;
  productName: string;
}

export function StockItemImage({ imageUrl, productName }: StockItemImageProps) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={productName}
        className="w-12 h-12 object-cover rounded-md"
      />
    );
  }

  return (
    <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
      <ImageIcon className="w-6 h-6 text-gray-400" />
    </div>
  );
}