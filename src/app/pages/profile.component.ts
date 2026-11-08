import { Component, inject } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '@auth0/auth0-angular';
import { MarketingService } from '../marketing.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [JsonPipe],
  template: `
    <h2 class="page-title">My Account</h2>
    @if (user(); as u) {
      <section class="profile">
        @if (u.picture) { <img [src]="u.picture" alt="Profile picture" width="96" height="96"> }
        <div>
          <h3>{{ u.name }}</h3>
          <p>{{ u.email }}
            <span class="tag">{{ u.email_verified ? 'Verified' : 'Unverified' }}</span></p>
          @if (marketing.optedIn()) {
            <p class="muted">Member of the Pizza 42 Dough Club 🍕</p>
          }
        </div>
      </section>
      @if (marketing.data(); as m) {
        <section class="profile marketing">
          <div>
            <h3>Marketing preferences <small class="muted">(from Auth0 Form + Action)</small></h3>
            <p>{{ m.marketing_opt_in ? 'Subscribed to marketing emails: 15% off your orders' : 'Not subscribed to marketing emails' }}</p>
          </div>
        </section>
      } @else {
        <p class="muted">No marketing claim found in the ID token. Is the Action deployed and attached to the Login flow?</p>
      }
      <details>
        <summary>Show ID token claims returned by Auth0</summary>
        <pre>{{ u | json }}</pre>
      </details>
    }
  `,
})
export class ProfileComponent {
  user = toSignal(inject(AuthService).user$);
  marketing = inject(MarketingService);
}
