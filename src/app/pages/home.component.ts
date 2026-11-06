import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="hero">
      <div>
        <h1>Wood-fired pizza.<br>Delivered in <em>42 minutes</em> or less.</h1>
        <p>Hand-stretched dough, 48-hour ferment, and a 900°F oven. Join Pizza 42 to save your
           favourites and order in a couple of taps.</p>
        <div class="row">
          <a routerLink="/menu" class="btn big">Order now</a>
          <button class="btn big ghost" (click)="signup()">Create an account</button>
        </div>
      </div>
      <div class="big-emoji" aria-hidden="true">🍕</div>
    </section>

    <section class="features">
      <article><h3>🔥 Fired hot</h3><p>Every pie is baked to order in under 90 seconds.</p></article>
      <article><h3>🌿 Fresh ingredients</h3><p>Local produce and imported Italian staples.</p></article>
      <article><h3>🛵 Fast delivery</h3><p>Hot at your door, or we take $5 off.</p></article>
    </section>
  `,
})
export class HomeComponent {
  private auth = inject(AuthService);
  signup() { this.auth.loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } }); }
}
