# Google login: user frontend and backend

This login is only for student/user accounts. It does not authenticate platform
admins and does not change any `/api/v1/admin` route.

## 1. Firebase Console setup

1. Open Firebase project `mbbs-e6f31`.
2. Go to **Authentication → Sign-in method → Google** and enable Google.
3. Add every frontend domain under **Authentication → Settings → Authorized domains**.
4. Go to **Project settings → Service accounts → Generate new private key**.
5. Put that service account's values in the backend environment using the
   `FIREBASE_*` variables shown in `config.env.example`. Never put the service
   account private key in frontend code or commit it to Git.
6. If `neet-auth` already exists in MongoDB, replace its old non-sparse phone
   index once during deployment. Google users do not have a required phone:

```js
db.getCollection("neet-auth").dropIndex("phoneNumber_1")
db.getCollection("neet-auth").createIndex(
  { phoneNumber: 1 },
  { unique: true, sparse: true, name: "phoneNumber_1" }
)
```

Check the actual index name first with
`db.getCollection("neet-auth").getIndexes()`. A new database gets the sparse
index directly from the updated Mongoose schema.

The Firebase web configuration (including its `apiKey`) belongs in the user
frontend. Firebase web API keys identify the Firebase project; authorization is
enforced by Firebase Authentication and by this backend's token verification.

## 2. Frontend login

Install `firebase`, initialize it with the web configuration, and use:

```js
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const auth = getAuth(app);
const result = await signInWithPopup(auth, new GoogleAuthProvider());
const idToken = await result.user.getIdToken();

const response = await fetch(`${API_URL}/api/v1/auth/google`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ idToken })
});

const body = await response.json();
if (!response.ok) throw new Error(body.message);

// Store according to the frontend's existing auth/session strategy.
const { accessToken, refreshToken, user, isNewUser } = body.data;
```

Do not send `email`, `name`, or Google UID as trusted login data. The backend
reads those values only from the cryptographically verified Firebase ID token.

## 3. Backend behavior

`POST /api/v1/auth/google` accepts `{ "idToken": "..." }`.

The backend:

1. verifies the token with Firebase Admin and checks revocation;
2. rejects non-Google providers and unverified email addresses;
3. creates a user on the first login, or links/logs in the existing user with
   the same verified email;
4. rejects deactivated users;
5. creates the normal backend auth session; and
6. returns the backend `accessToken` and `refreshToken`.

Use the returned backend access token—not the Firebase ID token—for protected
MBBS APIs:

```http
Authorization: Bearer <accessToken>
```

Refresh and logout remain unchanged:

- `POST /api/v1/auth/refresh-token` with `{ "refreshToken": "..." }`
- `POST /api/v1/auth/logout` with the backend access token
- `POST /api/v1/auth/logout-all` with the backend access token

Google users have no local password or required phone number. Existing
password/OTP users retain those requirements. If a verified Google email
matches an existing user, Google is added as another login provider for that
same user rather than creating a duplicate account.
