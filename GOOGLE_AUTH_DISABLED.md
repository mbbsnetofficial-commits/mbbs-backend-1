# Google authentication disabled

Google authentication is temporarily disabled at the routing layer. Its
controllers, services, model fields, and existing user data are preserved.

## Disabled endpoints

```text
POST /api/v1/auth/google
POST /api/v1/auth/google/password/setup-link
POST /api/v1/auth/google/password
```

These route registrations and the Google login Swagger operation are commented
out. Requests to them are no longer handled and return `404`.

## Active authentication flow

Students must use the existing phone-verified registration and email/password
login flow:

```text
POST /api/v1/auth/sign-up
  -> POST /api/v1/auth/sign-up/verify-otp
  -> POST /api/v1/auth/login
  -> receive accessToken and refreshToken
```

The frontend must also hide or comment out **Continue with Google**. The
frontend repository is not present in this workspace, so that UI change is not
included here.

## Existing Google-only accounts

An account with no password can no longer log in while Google authentication is
disabled. Before production rollout, ensure affected users receive an approved
account-recovery or password-migration path. Existing users who already have
both `google` and `password` providers can continue using email/password login.

## Restoring Google authentication

Uncomment the marked imports/routes in `routes/neet-routes/auth.routes.js` and
the marked Swagger operation in `swagger.js`. No database migration is needed.
