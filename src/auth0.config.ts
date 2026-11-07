// Replace with the values from your Auth0 dashboard:
// Applications > Applications > (your Single Page Application) > Settings
export const auth0Config = {
  domain: 'dev-71pawhlsa64b3iih.us.auth0.com',       // e.g. dev-abc123.us.auth0.com
  clientId: 'xLMuMRMIUbgsj6xTWH1LV2mc6izJjh75',
  // Identifier of the Pizza 42 API in Auth0 (APIs > Pizza 42 API). Must match exactly, no trailing slash.
  audience: 'https://api.pizza42.example.com',
  // Base URL of the Pizza 42 orders API (the pizza-42-api project)
  apiUrl: 'http://localhost:3001',
  // Permissions requested for the access token (granted only if the user's role includes them).
  apiScope: 'create:orders read:orders',
  // Must match NAMESPACE in auth0/post-login-marketing.js
  claimsNamespace: 'https://pizza42.example.com/',
};
