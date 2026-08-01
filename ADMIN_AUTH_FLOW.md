# Platform admin authentication

## Signing-key resolution

The backend resolves the admin JWT signing key in this order:

1. Use `ADMIN_SECRET_KEY` when it is configured.
2. Otherwise, derive an admin-only key from `SECRET_KEY` using HMAC-SHA256 and
   the fixed context `mbbs.net/platform-admin/jwt/v1`.
3. Return HTTP `503` only when neither server secret exists.

The fallback never signs admin tokens directly with the student secret.
Domain-separated derivation keeps student and admin JWTs cryptographically
distinct while allowing existing deployments to authenticate admins before a
dedicated secret is added.

An explicit production value remains recommended:

```env
ADMIN_SECRET_KEY=long-random-production-secret
ADMIN_LOGIN_EXPIRES=8h
```

Changing from the derived key to an explicit key invalidates existing admin
tokens, so administrators must log in again.

## Login flow

```text
POST /api/v1/admin/login
  -> resolve admin signing key
  -> find username in platform-admins
  -> require is_active=true
  -> compare submitted password with password_hash using bcrypt
  -> sign an HS256 admin_access JWT
  -> update last_login_at
  -> return admin and token
```

Request:

```json
{
  "username": "platform-admin-username",
  "password": "platform-admin-password"
}
```

Use the returned token on protected admin routes:

```http
Authorization: Bearer ADMIN_TOKEN
```

The protection middleware resolves the signing key through the same shared
function, verifies the JWT role and token type, reloads the admin account, and
checks active status and token version.
