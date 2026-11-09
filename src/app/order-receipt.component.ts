import { Component, input } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Order } from './order.model';

/** Shows an order exactly as the API returned it. Used for the receipt and the order history. */
@Component({
  selector: 'app-order-receipt',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  template: `
    <article class="receipt" aria-label="Order receipt">
      <div class="row between">
        <strong>Order #{{ order().id.slice(0, 8) }}</strong>
        <span class="tag">{{ order().status }}</span>
      </div>
      <p class="muted">{{ order().createdAt | date: 'medium' }}</p>
      @for (l of order().lines; track $index) {
        <div class="row between">
          <span>{{ l.qty }} × {{ l.name }} <small>({{ l.size }})</small></span>
          <span>{{ l.lineCents / 100 | currency }}</span>
        </div>
      }
      <hr>
      <div class="row between"><span>Subtotal</span><span>{{ order().subtotalCents / 100 | currency }}</span></div>
      @if (order().discountCents > 0) {
        <div class="row between promo-line"><span>Email subscriber (15% off)</span><span>−{{ order().discountCents / 100 | currency }}</span></div>
      }
      <div class="row between"><strong>Total</strong><strong>{{ order().totalCents / 100 | currency }}</strong></div>
      @if (order().isLarge) {
        <p class="muted">Over $100: placed after step-up authentication.</p>
      }
    </article>
  `,
})
export class OrderReceiptComponent {
  order = input.required<Order>();
}
