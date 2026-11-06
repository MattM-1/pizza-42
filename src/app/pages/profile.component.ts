import { Component, inject } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '@auth0/auth0-angular';

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
          <p class="muted">Member of the Pizza 42 Dough Club 🍕</p>
        </div>
      </section>
      <details>
        <summary>Show ID token claims returned by Auth0</summary>
        <pre>{{ u | json }}</pre>
      </details>
    }
  `,
})
export class ProfileComponent {
  user = toSignal(inject(AuthService).user$);
}
