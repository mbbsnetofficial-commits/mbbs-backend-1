# User login activity for the admin portal

Every successful student email/password login creates one append-only event in:

```text
neet-app-user-activity
```

## Login-to-audit flow

```text
POST /api/v1/auth/login
  -> normalize email
  -> confirm registered active user
  -> verify bcrypt password
  -> create auth-sessions record and JWTs
  -> append login event to neet-app-user-activity
  -> return accessToken and refreshToken
```

An activity record contains:

```json
{
  "user_id": "NEET_AUTH_OBJECT_ID",
  "student_id": "STU...",
  "email": "student@example.com",
  "first_name": "student",
  "last_name": "user",
  "event_type": "login",
  "auth_method": "password",
  "login_at": "2026-07-30T10:00:00.000Z",
  "session_id": "AUTH_SESSION_OBJECT_ID",
  "ip_address": "203.0.113.10",
  "user_agent": "Browser user-agent",
  "created_at": "2026-07-30T10:00:00.000Z"
}
```

Passwords, password hashes, access tokens, refresh tokens, and refresh JTIs are
never written to this collection.

Audit storage is best-effort after the authentication session is created. A
temporary activity database/index failure is logged server-side but does not
turn a valid login into a failed response.

## Admin API

```http
GET /api/v1/admin/user-login-activity
Authorization: Bearer ADMIN_TOKEN
```

Available query parameters:

| Parameter | Purpose |
| --- | --- |
| `page` | Page number; default 1 |
| `limit` | Items per page; default 20, maximum 100 |
| `search` | Email, student ID, name, IP, or user-agent search |
| `user_id` | Exact neet-auth ObjectId |
| `student_id` | Exact generated student ID |
| `email` | Exact normalized email |
| `ip_address` | Exact client IP |
| `date_from` | Login timestamp lower bound |
| `date_to` | Login timestamp upper bound |

Example:

```http
GET /api/v1/admin/user-login-activity?page=1&limit=20&search=student@example.com
Authorization: Bearer ADMIN_TOKEN
```

The newest login appears first. Only platform-admin JWTs can access this API.

## One-time index repair

The collection previously enforced one record per numeric user ID. Append-only
events require removing those legacy unique indexes and creating query indexes:

```bash
npm run repair:user-activity-indexes
```

The command changes indexes only. Existing legacy activity documents are
preserved and excluded from the admin login-event API because they do not have
`event_type: "login"`.
