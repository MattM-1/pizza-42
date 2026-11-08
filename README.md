# Pizza 42

Angular 22 (zoneless) single-page app for a pizza-ordering site, built to demonstrate Auth0: sign-up / log-in,
marketing opt-in, an email verification gate, and step-up MFA for large orders.

## Related repositories
- **pizza-42-api**: Express orders API. Validates Auth0 access tokens and enforces permissions.
- **Auth0 tenant repo**: exported tenant configuration (Actions, Form, API, roles, MFA settings).

## Auth0 setup
1. Create an application of type **Single Page Application**.
2. Set **Allowed Callback URLs**, **Allowed Logout URLs** and **Allowed Web Origins** to `http://localhost:4200`.
3. Create an API with identifier `https://api.pizza42.example.com`. Enable **RBAC** and **Add Permissions in the Access Token**.
   Define the permissions `create:orders`, `read:orders` and `create:large-orders`.
4. Create a `customer` role with `create:orders` and `read:orders`. Do **not** add `create:large-orders` to the role:
   an Action grants it only after step-up MFA.
5. Deploy the post-login Actions (step-up MFA, the scope Action, marketing opt-in) and add them to the Login flow.
6. Put your Domain, Client ID, API audience and API URL in `src/auth0.config.ts`.

## Run
Requires Node `^22.22.3 || ^24.15.0 || ^26.0.0` (an `.nvmrc` for Node 26 is included). The orders API
(`pizza-42-api`) must be running at the `apiUrl` set in `src/auth0.config.ts`.

```bash
npm install
npm start     # http://localhost:4200
```

`npm start` (`ng serve`) uses the **development** environment and calls a local API at `http://localhost:3001`.
`ng build` uses the default environment and calls the hosted API. Both URLs live in `src/environments/`.

## What it shows
- **Sign up** button → Auth0 Universal Login with `screen_hint: 'signup'`
- **Log in / Log out** via `@auth0/auth0-angular`
- `/profile` protected by `authGuardFn`
- Checkout requires login; the cart survives the redirect (sessionStorage)
- Orders are placed through the orders API with an Auth0 access token (the server prices the order)

## Marketing opt-in via Auth0 Form + Action
A post-login Auth0 Action (kept in the separate Auth0 tenant repo) renders an Auth0 Form (opt in to marketing emails for 15% off, one yes/no question) on first login, stores the answer in
`app_metadata.marketing_opt_in`, and adds `{ marketing_opt_in }` to the ID token. Opted-in users see a 15% off
banner and the discount is applied to the cart total (`marketing.service.ts`).

## Email verification gate
Users with an unverified email can log in and browse, but "Place order" is disabled until the ID token has
`email_verified: true` (see `menu.component.ts`). "I've verified my email" refreshes the token from Auth0.

## Step-up MFA for orders over $100
1. The app sends the order to the API. For an order over $100 without the `create:large-orders` scope, the API
   responds `403 { "error": "step_up_required" }`.
2. The app handles that response and starts a new authorize request with `acr_values` for multi-factor.
3. An Auth0 Action challenges the user's enrolled factor (or enrolls them in TOTP if they have none).
4. A second Action adds `create:large-orders` to the access token after MFA succeeds. The user then places the order again.

The cart shows a notice whenever the total is over $100 so the extra check is expected.
