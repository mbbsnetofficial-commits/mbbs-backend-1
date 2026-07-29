# Google authentication flow

One **Continue with Google** action handles both registration and login. The
button can appear on the login page and, optionally, on the registration page,
but both buttons must call the same frontend function and backend endpoint.

## Required setup

### Firebase Console

1. Use the same Firebase project in the frontend and backend.
2. Enable **Authentication > Sign-in method > Google**.
3. Add every frontend hostname under **Authentication > Settings >
   Authorized domains**.

### Frontend environment

Configure the Firebase Web SDK with the public web application values from the
same Firebase project. Never put a Firebase Admin private key in the frontend.

### Backend environment

Configure `FIREBASE_PROJECT_ID` and either:

- `FIREBASE_SERVICE_ACCOUNT_JSON`, or
- `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY`.

Also include every browser origin in the comma-separated `FRONTEND_URL` value.

## Frontend request

After Firebase completes Google sign-in, get a fresh Firebase ID token and send
it once to the backend:

```js
const credential = await signInWithPopup(auth, googleProvider);
const idToken = await credential.user.getIdToken();

const response = await fetch(`${API_URL}/api/v1/auth/google`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ idToken })
});

const result = await response.json();
if (!response.ok) throw new Error(result.message);

localStorage.setItem("accessToken", result.data.accessToken);
localStorage.setItem("refreshToken", result.data.refreshToken);
navigate("/dashboard");
```

Do not send the Google OAuth access token. The backend requires the Firebase
**ID token** returned by `user.getIdToken()`.

## Backend behavior

`POST /api/v1/auth/google` verifies that the token:

- was issued by the configured Firebase project,
- came from the `google.com` provider, and
- contains a verified email.

The backend then searches the `neet-auth` collection by Firebase UID or email.

- Existing user: link/update the Google identity and create a login session.
- New user: create a `neet-auth` document, generate `student_id`, and create a
  login session immediately.
- Deactivated user: return `403` without logging in.

Both new and existing users receive `data.accessToken`,
`data.refreshToken`, and `data.user`. A new user additionally receives
`data.isNewUser: true` and HTTP `201`; an existing user receives
`data.isNewUser: false` and HTTP `200`.

Use the access token for protected requests:

```http
Authorization: Bearer ACCESS_TOKEN
```

## Common errors

- `400 idToken is required`: frontend did not send `{ idToken }`.
- `401 Invalid or expired...`: wrong token type, expired token, or frontend and
  backend use different Firebase projects.
- `401 Google tokens only`: the Firebase session was not created with Google.
- `403 deactivated`: the matching `neet-auth` account is disabled.
- `429`: too many failed attempts from the same network; respect
  `retryAfterSeconds`.
- `503 Firebase configuration is invalid`: correct the backend Firebase Admin
  environment variables.
