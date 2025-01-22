interface StockStatusProps {
  available: number;
}

export function StockStatus({ available }: StockStatusProps) {
  const getStockStatus = (available: number) => {
    if (available <= 0) return "Out of Stock";
    if (available < 10) return "Low Stock";
    return "In Stock";
  };

  const getStatusClass = (available: number) => {
    if (available <= 0) return 'bg-red-100 text-red-800';
    if (available < 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(available)}`}>
      {getStockStatus(available)}
    </span>
  );
}