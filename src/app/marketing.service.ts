import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '@auth0/auth0-angular';
import { auth0Config } from '../auth0.config';

export const MARKETING_DISCOUNT = 0.15; // 15% off the order total for opted-in customers

/** Reads the `marketing_opt_in` claim added by the Auth0 post-login Action. */
@Injectable({ providedIn: 'root' })
export class MarketingService {
  private user = toSignal(inject(AuthService).user$);

  readonly data = computed<{ marketing_opt_in: boolean } | null>(
    () => this.user()?.[auth0Config.claimsNamespace + 'marketing'] ?? null,
  );

  readonly optedIn = computed(
    () => this.data()?.marketing_opt_in === true,
  );
}
