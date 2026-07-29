# Google account password setup

A Google-authenticated student can create a separate MBBS.NET password and
then use either login method on the same `neet-auth` account. The Google
password is never requested, stored, generated, or emailed.

## API flow

### 1. Log in with Google

```http
POST /api/v1/auth/google
Content-Type: application/json

{ "idToken": "FIREBASE_ID_TOKEN" }
```

Store the returned access and refresh tokens.

The Google-login user object also returns:

```json
{
  "hasPassword": false,
  "canSetPassword": true
}
```

Show **Create password** only when `canSetPassword` is `true`.

If the product requires the email immediately after first Google login, the
frontend may call the setup-link endpoint once when `canSetPassword` is true.
Do not repeat that call on every render; keep the button available for manual
resending after the cooldown.

### 2. Request the password-setup email

```http
POST /api/v1/auth/google/password/setup-link
Authorization: Bearer ACCESS_TOKEN
```

The backend confirms that the account is an active Google account without an
existing password. It emails a one-time link to the already Google-verified
address. Requests have a 60-second cooldown.

### 3. Open the frontend link

The email points to:

```text
https://your-frontend-domain.com/set-password?token=ONE_TIME_TOKEN
```

The link expires after 15 minutes. The database stores only its SHA-256 hash.

### 4. Create the password

```http
POST /api/v1/auth/google/password
Content-Type: application/json

{
  "token": "ONE_TIME_TOKEN",
  "password": "student-created-password",
  "confirmPassword": "student-created-password"
}
```

The token is claimed atomically, the password is hashed by the existing
`neet-auth` model, and `password` is added to `auth_providers`.

### 5. Future login

The same student can continue using Google or:

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "verified-google-email@example.com",
  "password": "student-created-password"
}
```

Both methods return sessions for the same MongoDB user and `student_id`.

## Frontend requirements

- Add a **Create password** action after Google login or in Account Settings.
- Call the protected setup-link endpoint once when the user requests the email.
- Add a `/set-password` page that reads the token from the URL.
- Ask for password and confirmation; never ask for the Google password.
- After success, remove the token from the browser URL and redirect to login or
  Account Settings.
- Treat expired/used token responses as a prompt to request a new email.

## Required backend configuration

Configure the SMTP variables and `PASSWORD_SETUP_FRONTEND_URL` shown in
`config.env.example`. In production, the frontend URL must use HTTPS.
