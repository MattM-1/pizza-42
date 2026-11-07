import { Component, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CurrencyPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '@auth0/auth0-angular';
import { MARKETING_DISCOUNT, MarketingService } from '../marketing.service';
import { CartService, MENU, Pizza, SIZE_LABEL, Size } from '../cart.service';
import { auth0Config } from '../../auth0.config';

const MFA_ACR = 'http://schemas.openid.net/pape/policies/2007/06/multi-factor'; // must match the Auth0 Action
const STEP_UP_THRESHOLD = 100; // dollars; keep in sync with the API (orders strictly over this need step-up)

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
          <div class="row between total"><span>Total</span><strong>{{ total() | currency }}</strong></div>
          @if (needsStepUp()) {
            <p class="stepup" role="status">
              🔐 <strong>Step-up authentication required.</strong> Orders over $100 need an extra MFA check.
              You'll be asked to verify when you place this order.
            </p>
          }
          @if (orderError()) {
            <p class="error" role="alert">{{ orderError() }}</p>
          }
          <button class="btn full" [disabled]="ordering() || (isAuthenticated() && !emailVerified())" (click)="checkout()">
            {{ ordering() ? 'Placing order…' : !isAuthenticated() ? 'Log in to order' : !emailVerified() ? 'Verify email to order' : 'Place order' }}
          </button>
        }
      </aside>
    </div>
  `,
})
export class MenuComponent {
  private auth = inject(AuthService);
  private http = inject(HttpClient);
  cart = inject(CartService);
  marketing = inject(MarketingService);
  isAuthenticated = toSignal(this.auth.isAuthenticated$, { initialValue: false });

  user = toSignal(this.auth.user$);
  emailVerified = computed(() => this.user()?.email_verified === true);
  checking = signal(false);
  rechecked = signal(false);
  discount = computed(() => (this.marketing.optedIn() ? this.cart.subtotal() * MARKETING_DISCOUNT : 0));
  total = computed(() => this.cart.subtotal() - this.discount());
  needsStepUp = computed(() => this.total() > STEP_UP_THRESHOLD);

  menu = MENU;
  sizes: Size[] = ['S', 'M', 'L'];
  labels = SIZE_LABEL;
  placed = signal(false);
  ordering = signal(false);
  orderError = signal('');
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

  async checkout() {
    if (!this.isAuthenticated()) {
      // Cart is persisted in sessionStorage, so it will be here after login.
      this.auth.loginWithRedirect({ appState: { target: '/menu' } });
      return;
    }
    // Email verification gate: browsing is open, ordering requires a verified email.
    if (!this.emailVerified()) return;

    this.placed.set(false);
    this.orderError.set('');
    this.ordering.set(true);
    try {
      // The auth interceptor adds the access token. The API prices the order itself.
      const items = this.cart.lines().map((l) => ({ pizzaId: l.pizza.id, size: l.size, qty: l.qty }));
      await firstValueFrom(this.http.post(`${auth0Config.apiUrl}/orders`, { items }));
      this.cart.clear();
      this.placed.set(true);
    } catch (err) {
      // Orders over $100 are rejected until the user completes step-up MFA. Start a new authorize request
      // with acr_values; the Auth0 Action challenges the user and the new token carries create:large-orders.
      if (err instanceof HttpErrorResponse && err.status === 403 && err.error?.error === 'step_up_required') {
        this.auth.loginWithRedirect({
          appState: { target: '/menu' },
          authorizationParams: { acr_values: MFA_ACR },
        });
        return;
      }
      this.orderError.set(
        err instanceof HttpErrorResponse && err.error?.message ? err.error.message : 'Sorry, we could not place your order.',
      );
    } finally {
      this.ordering.set(false);
    }
  }
}
