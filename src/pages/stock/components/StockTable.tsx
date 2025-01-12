import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { StockItem } from "@/types/stock";

interface StockTableProps {
  items: StockItem[];
}

export function StockTable({ items }: StockTableProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search items..."
          className="pl-10 w-full md:max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Stock Code</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Box Details</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Initial Price</TableHead>
              <TableHead>Selling Price</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.stockCode}>
                <TableCell className="font-medium">{item.stockCode}</TableCell>
                <TableCell>{item.productName}</TableCell>
                <TableCell>{item.boxDetails}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>${item.initialPrice.toFixed(2)}</TableCell>
                <TableCell>${item.sellingPrice.toFixed(2)}</TableCell>
                <TableCell>${item.discount}</TableCell>
                <TableCell>{item.location}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}