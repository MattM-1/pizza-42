import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authHttpInterceptorFn, provideAuth0 } from '@auth0/auth0-angular';
import { routes } from './app.routes';
import { auth0Config } from '../auth0.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authHttpInterceptorFn])), // attaches the access token to API calls
    provideAuth0({
      domain: auth0Config.domain,
      clientId: auth0Config.clientId,
      authorizationParams: {
        redirect_uri: window.location.origin,
        audience: auth0Config.audience, // makes the access token a JWT for the Pizza 42 API
        scope: `openid profile email ${auth0Config.apiScope}`,
      },
      // Only requests to the orders API get the Bearer token attached.
      httpInterceptor: { allowedList: [`${auth0Config.apiUrl}/*`] },
    }),
  ],
};
