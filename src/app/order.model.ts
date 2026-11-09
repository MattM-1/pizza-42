/** An order as returned by the Pizza 42 API (amounts are integer cents, calculated by the API). */
export interface OrderLine {
  pizzaId: string;
  name: string;
  size: 'S' | 'M' | 'L';
  qty: number;
  unitCents: number;
  lineCents: number;
}

export interface Order {
  id: string;
  status: string;
  createdAt: string;
  lines: OrderLine[];
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  isLarge: boolean;
}
