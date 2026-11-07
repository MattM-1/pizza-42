import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { toSignal } from '@angular/core/rxjs-interop';
import { CartService } from './cart.service';
import { MARKETING_DISCOUNT, MarketingService } from './marketing.service';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <header class="nav">
      <a routerLink="/" class="logo">🍕 Pizza <span>42</span></a>
      <nav>
        <a routerLink="/menu" routerLinkActive="active">Menu</a>
        @if (isAuthenticated()) {
          <a routerLink="/profile" routerLinkActive="active">My Account</a>
        }
      </nav>
      <div class="actions">
        @if (auth.isLoading$ | async) {
          <span class="muted">…</span>
        } @else if (user(); as u) {
          <span class="hello">Hi, {{ u.given_name || u.nickname || u.name }}!</span>
          <button class="btn ghost" (click)="logout()">Log out</button>
        } @else {
          <button class="btn ghost" (click)="login()">Log in</button>
          <button class="btn" (click)="signup()">Sign up</button>
        }
      </div>
    </header>

    @if (marketing.optedIn()) {
      <div class="promo-bar">🎉 You're signed up for our email specials, so enjoy {{ discountPct }}% off your order total!</div>
    }

    <main><router-outlet /></main>

    <footer>
      <p>© 2026 Pizza 42 · 42 Hitchhiker Way · Open daily 11am–11pm</p>
      <p class="muted">Demo site for Auth0 integration. No real pizzas will be delivered (sadly).</p>
    </footer>
  `,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AsyncPipe],
})
export class AppComponent {
  auth = inject(AuthService);
  cart = inject(CartService);
  marketing = inject(MarketingService);
  discountPct = MARKETING_DISCOUNT * 100;
  isAuthenticated = toSignal(this.auth.isAuthenticated$, { initialValue: false });
  user = toSignal(this.auth.user$);

  login() { this.auth.loginWithRedirect(); }
  signup() { this.auth.loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } }); }
  logout() { this.auth.logout({ logoutParams: { returnTo: window.location.origin } }); }
}
