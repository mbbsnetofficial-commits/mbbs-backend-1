# Registered-user login flow

Google authentication is disabled. Student login is available only through the
email/password endpoint:

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "student-password"
}
```

## Backend decision flow

```text
Normalize email (trim + lowercase)
  -> find the email in neet-auth
  -> require an active account
  -> require a stored MBBS.NET password
  -> compare the submitted password with its bcrypt hash
  -> create access and refresh tokens
```

Only a successful response should open the dashboard. The frontend must not
determine whether an email is registered.

Unregistered emails, passwordless accounts, and incorrect passwords all return
the same HTTP `401` response:

```json
{
  "status": "fail",
  "message": "Invalid email or password."
}
```

This generic response avoids exposing which email addresses exist. An inactive
registered account returns HTTP `403` with the deactivation message.

## Becoming a registered user

Public signup remains a separate flow:

```text
POST /api/v1/auth/sign-up
  -> verify the phone OTP at /api/v1/auth/sign-up/verify-otp
  -> neet-auth account is created
  -> user can call /api/v1/auth/login
```

Starting signup without completing OTP verification does not create a login-
eligible user.
