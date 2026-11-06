# Pizza 42

Angular 22 (zoneless) single-page app demonstrating Auth0 sign-up / log-in on a pizza-ordering site.

## Auth0 setup
1. In the Auth0 dashboard create an application of type **Single Page Application**.
2. Set **Allowed Callback URLs**, **Allowed Logout URLs** and **Allowed Web Origins** to `http://localhost:4200`.
3. Put your Domain and Client ID in `src/auth0.config.ts`.

## Run
Requires Node `^22.22.3 || ^24.15.0 || ^26.0.0` (an `.nvmrc` for Node 26 is included).

```bash
npm install
npm start     # http://localhost:4200
```

## What it shows
- **Sign up** button → Auth0 Universal Login with `screen_hint: 'signup'`
- **Log in / Log out** via `@auth0/auth0-angular`
- `/profile` protected by `authGuardFn`
- Checkout requires login; the cart survives the redirect (sessionStorage)
