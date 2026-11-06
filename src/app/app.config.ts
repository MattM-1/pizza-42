import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAuth0 } from '@auth0/auth0-angular';
import { routes } from './app.routes';
import { auth0Config } from '../auth0.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAuth0({
      domain: auth0Config.domain,
      clientId: auth0Config.clientId,
      authorizationParams: { redirect_uri: window.location.origin },
    }),
  ],
};
