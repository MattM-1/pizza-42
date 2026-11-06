import { Injectable, computed, signal } from '@angular/core';

export type Size = 'S' | 'M' | 'L';
export interface Pizza { id: string; name: string; emoji: string; desc: string; price: number; tag?: string; }
export interface CartLine { pizza: Pizza; size: Size; qty: number; }

export const SIZE_MULT: Record<Size, number> = { S: 0.8, M: 1, L: 1.25 };
export const SIZE_LABEL: Record<Size, string> = { S: '10"', M: '12"', L: '16"' };

export const MENU: Pizza[] = [
  { id: 'margherita', name: 'Margherita', emoji: '🍅', desc: 'San Marzano tomato, fior di latte, basil, olive oil.', price: 12 },
  { id: 'pepperoni', name: 'Pepperoni Classico', emoji: '🌶️', desc: 'Cup-and-char pepperoni, mozzarella, hot honey drizzle.', price: 14, tag: 'Bestseller' },
  { id: 'funghi', name: 'Funghi Bianca', emoji: '🍄', desc: 'Garlic cream, roasted mushrooms, thyme, parmesan.', price: 14 },
  { id: 'quattro', name: 'Quattro Formaggi', emoji: '🧀', desc: 'Mozzarella, gorgonzola, fontina, pecorino.', price: 15 },
  { id: 'veggie', name: 'Garden Party', emoji: '🥬', desc: 'Peppers, red onion, olives, artichoke, cherry tomato.', price: 14, tag: 'Vegan option' },
  { id: 'answer', name: 'The Answer (42)', emoji: '🔥', desc: 'Our signature: sausage, soppressata, bacon, calabrian chili, 42-day aged mozzarella.', price: 18, tag: 'Signature' },
];

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly KEY = 'pizza42-cart';
  readonly lines = signal<CartLine[]>(this.load());
  readonly count = computed(() => this.lines().reduce((n, l) => n + l.qty, 0));
  readonly subtotal = computed(() =>
    this.lines().reduce((t, l) => t + l.pizza.price * SIZE_MULT[l.size] * l.qty, 0));

  price(p: Pizza, s: Size) { return p.price * SIZE_MULT[s]; }

  add(pizza: Pizza, size: Size) {
    const lines = [...this.lines()];
    const i = lines.findIndex((l) => l.pizza.id === pizza.id && l.size === size);
    if (i >= 0) lines[i] = { ...lines[i], qty: lines[i].qty + 1 };
    else lines.push({ pizza, size, qty: 1 });
    this.set(lines);
  }

  change(index: number, delta: number) {
    const lines = [...this.lines()];
    lines[index] = { ...lines[index], qty: lines[index].qty + delta };
    this.set(lines.filter((l) => l.qty > 0));
  }

  clear() { this.set([]); }

  private set(lines: CartLine[]) {
    this.lines.set(lines);
    try { sessionStorage.setItem(this.KEY, JSON.stringify(lines)); } catch { /* ignore */ }
  }

  // Persisted so the cart survives the redirect to Auth0 and back.
  private load(): CartLine[] {
    try { return JSON.parse(sessionStorage.getItem(this.KEY) ?? '[]'); } catch { return []; }
  }
}
