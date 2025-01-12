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

export function StockTable() {
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
            <TableRow>
              <TableCell className="font-medium">STK001</TableCell>
              <TableCell>Product A</TableCell>
              <TableCell>Box of Product A with 13 pieces inside</TableCell>
              <TableCell>pcs</TableCell>
              <TableCell>$100.00</TableCell>
              <TableCell>$150.00</TableCell>
              <TableCell>$10.00 (6.67%)</TableCell>
              <TableCell>Warehouse A</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}