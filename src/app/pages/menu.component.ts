import { Component, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CurrencyPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '@auth0/auth0-angular';
import { MARKETING_DISCOUNT, MarketingService } from '../marketing.service';
import { CartService, MENU, Pizza, SIZE_LABEL, Size } from '../cart.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    @if (isAuthenticated() && !emailVerified()) {
      <div class="verify" role="alert">
        <div>
          <strong>✉️ Please verify your email to place an order.</strong>
          <p>We sent a verification link to <b>{{ user()?.email }}</b>. You can keep browsing the menu and
             filling your cart in the meantime.</p>
          @if (rechecked() && !emailVerified()) {
            <p class="muted">Still not verified. Click the link in the email, then try again.</p>
          }
        </div>
        <button class="btn" [disabled]="checking()" (click)="recheck()">
          {{ checking() ? 'Checking…' : "I've verified my email" }}
        </button>
      </div>
    }
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
          @if (discount() > 0) {
            <div class="row between"><span>Subtotal</span><span>{{ cart.subtotal() | currency }}</span></div>
            <div class="row between promo-line"><span>Email subscriber (15% off)</span><span>−{{ discount() | currency }}</span></div>
          }
          <div class="row between total"><span>Total</span><strong>{{ cart.subtotal() - discount() | currency }}</strong></div>
          <button class="btn full" [disabled]="isAuthenticated() && !emailVerified()" (click)="checkout()">
            {{ !isAuthenticated() ? 'Log in to order' : emailVerified() ? 'Place order' : 'Verify email to order' }}
          </button>
        }
      </aside>
    </div>
  `,
})
export class MenuComponent {
  private auth = inject(AuthService);
  cart = inject(CartService);
  marketing = inject(MarketingService);
  isAuthenticated = toSignal(this.auth.isAuthenticated$, { initialValue: false });

  user = toSignal(this.auth.user$);
  emailVerified = computed(() => this.user()?.email_verified === true);
  checking = signal(false);
  rechecked = signal(false);
  discount = computed(() => (this.marketing.optedIn() ? this.cart.subtotal() * MARKETING_DISCOUNT : 0));

  menu = MENU;
  sizes: Size[] = ['S', 'M', 'L'];
  labels = SIZE_LABEL;
  placed = signal(false);
  private chosen = signal<Record<string, Size>>({});

  sizeOf(p: Pizza): Size { return this.chosen()[p.id] ?? 'M'; }
  pick(p: Pizza, s: Size) { this.chosen.update((c) => ({ ...c, [p.id]: s })); }

  /** Pull a fresh ID token from Auth0 so email_verified reflects the latest state. */
  async recheck() {
    this.checking.set(true);
    try {
      await firstValueFrom(this.auth.getAccessTokenSilently({ cacheMode: 'off' }));
      this.rechecked.set(true);
    } catch {
      // Silent refresh can fail (e.g. blocked third-party cookies): fall back to a quick redirect.
      this.auth.loginWithRedirect({ appState: { target: '/menu' } });
    } finally {
      this.checking.set(false);
    }
  }

  checkout() {
    if (!this.isAuthenticated()) {
      // Cart is persisted in sessionStorage, so it will be here after login.
      this.auth.loginWithRedirect({ appState: { target: '/menu' } });
      return;
    }
    // Email verification gate: browsing is open, ordering requires a verified email.
    if (!this.emailVerified()) return;
    // Proof of concept: no backend. A real app would POST the order with the access token.
    this.cart.clear();
    this.placed.set(true);
  }
}
