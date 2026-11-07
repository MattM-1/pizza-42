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

## Marketing opt-in via Auth0 Form + Action
`auth0/post-login-marketing.js` renders an Auth0 Form (opt in to marketing emails for 15% off, one yes/no question) on first login, stores the answer in
`app_metadata.marketing_opt_in`, and adds `{ marketing_opt_in }` to the ID token. Opted-in users see a 15% off
banner and the discount is applied to the cart total (`marketing.service.ts`).

## Email verification gate
Users with an unverified email can log in and browse, but "Place order" is disabled until the ID token has
`email_verified: true` (see `menu.component.ts`). "I've verified my email" refreshes the token from Auth0.
