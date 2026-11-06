import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '@auth0/auth0-angular';
import { CartService, MENU, Pizza, SIZE_LABEL, Size } from '../cart.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <h2 class="page-title">Our Menu</h2>
    <div class="layout">
      <section class="grid">
        @for (p of menu; track p.id) {
          <article class="card">
            <div class="emoji">{{ p.emoji }}</div>
            @if (p.tag) { <span class="tag">{{ p.tag }}</span> }
            <h3>{{ p.name }}</h3>
            <p>{{ p.desc }}</p>
            <div class="sizes">
              @for (s of sizes; track s) {
                <button [class.sel]="sizeOf(p) === s" (click)="pick(p, s)">{{ s }} · {{ labels[s] }}</button>
              }
            </div>
            <div class="row between">
              <strong>{{ cart.price(p, sizeOf(p)) | currency }}</strong>
              <button class="btn" (click)="cart.add(p, sizeOf(p))">Add</button>
            </div>
          </article>
        }
      </section>

      <aside class="cart">
        <h3>Your order</h3>
        @if (placed()) {
          <p class="success">🎉 Order placed! Your pizza is on its way (in spirit).</p>
        }
        @if (cart.lines().length === 0) {
          <p class="muted">Your cart is empty.</p>
        } @else {
          @for (l of cart.lines(); track $index) {
            <div class="line">
              <div>{{ l.pizza.name }} <small>({{ l.size }})</small></div>
              <div class="qty">
                <button (click)="cart.change($index, -1)">−</button>
                <span>{{ l.qty }}</span>
                <button (click)="cart.change($index, 1)">+</button>
              </div>
            </div>
          }
          <div class="row between total"><span>Subtotal</span><strong>{{ cart.subtotal() | currency }}</strong></div>
          <button class="btn full" (click)="checkout()">
            {{ isAuthenticated() ? 'Place order' : 'Log in to order' }}
          </button>
        }
      </aside>
    </div>
  `,
})
export class MenuComponent {
  private auth = inject(AuthService);
  cart = inject(CartService);
  isAuthenticated = toSignal(this.auth.isAuthenticated$, { initialValue: false });

  menu = MENU;
  sizes: Size[] = ['S', 'M', 'L'];
  labels = SIZE_LABEL;
  placed = signal(false);
  private chosen = signal<Record<string, Size>>({});

  sizeOf(p: Pizza): Size { return this.chosen()[p.id] ?? 'M'; }
  pick(p: Pizza, s: Size) { this.chosen.update((c) => ({ ...c, [p.id]: s })); }

  checkout() {
    if (!this.isAuthenticated()) {
      // Cart is persisted in sessionStorage, so it will be here after login.
      this.auth.loginWithRedirect({ appState: { target: '/menu' } });
      return;
    }
    // Proof of concept: no backend. A real app would POST the order with the access token.
    this.cart.clear();
    this.placed.set(true);
  }
}
