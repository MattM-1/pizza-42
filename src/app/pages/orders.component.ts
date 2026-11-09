import { Component, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '@auth0/auth0-angular';
import { auth0Config } from '../../auth0.config';
import { Order } from '../order.model';
import { OrderReceiptComponent } from '../order-receipt.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [OrderReceiptComponent],
  template: `
    <h2 class="page-title">My Orders</h2>
    @if (customerId(); as id) {
      <section class="customer-id">
        <p>Customer ID: <code>{{ id }}</code></p>
        <p class="muted">A unique ID Auth0 created for you at your first sign-in and stored in your profile's app metadata. Your order details are stored separately on Pizza 42's backend server.</p>
      </section>
    }
    @if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
    } @else if (orders() === null) {
      <p class="muted">Loading your orders…</p>
    } @else if (orders()!.length === 0) {
      <p class="muted">No orders yet.</p>
    } @else {
      <div class="orders">
        @for (o of orders()!; track o.id) {
          <app-order-receipt [order]="o" />
        }
      </div>
    }
  `,
})
export class OrdersComponent {
  private http = inject(HttpClient);
  private user = toSignal(inject(AuthService).user$);

  /** The unique customer ID added to the ID token by the Auth0 "Add Customer ID" Action. */
  customerId = computed<string | null>(() => this.user()?.[auth0Config.claimsNamespace + 'customer_id'] ?? null);
  orders = signal<Order[] | null>(null);
  error = signal('');

  constructor() {
    // The auth interceptor adds the access token; the API returns only this customer's orders (read:orders).
    this.http.get<Order[]>(`${auth0Config.apiUrl}/orders`).subscribe({
      next: (list) => this.orders.set([...list].reverse()), // newest first
      error: () => this.error.set('Sorry, we could not load your orders.'),
    });
  }
}
