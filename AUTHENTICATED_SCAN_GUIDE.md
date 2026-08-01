# Authenticated Security Scan Configuration Guide

This guide provides instructions for security engineers and automated DAST scanners (OWASP ZAP, Burp Suite, Nuclei, Postman) to perform deep, authenticated vulnerability testing against `https://api.mbbs.net`.

---

## 1. OpenAPI Specification Discovery

The backend exposes full OpenAPI 3.0 specification schemas at:

- `https://api.mbbs.net/openapi.json`
- `https://api.mbbs.net/swagger.json`
- `https://api.mbbs.net/api-docs.json`

Import one of these endpoints into OWASP ZAP or Burp Suite to automatically seed the target URL API tree.

---

## 2. API Documentation & Schema Authentication (Basic Auth)

The API documentation and schema endpoints require HTTP Basic Authentication:

- **Username**: `admin` (or value of `SWAGGER_USER`)
- **Password**: Configured in `SWAGGER_PASSWORD` (default: `sas1627`)
- **Header format**: `Authorization: Basic <base64(username:password)>`

### Example cURL:

```bash
curl -u "admin:sas1627" https://api.mbbs.net/openapi.json
```

---

## 3. Student & User API Authentication (JWT Bearer Token)

To test authenticated student routes under `/api/v1/*`:

1. **Obtain Test User Credentials**:
   Create a dedicated low-privilege test account via `POST /api/v1/auth/register` or `POST /api/v1/auth/login`.

2. **Login Request**:

   ```http
   POST /api/v1/auth/login
   Content-Type: application/json

   {
     "identifier": "+919876543210",
     "password": "TestUserPassword123!"
   }
   ```

3. **Response Payload**:

   ```json
   {
     "status": "success",
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "refreshToken": "..."
   }
   ```

4. **Configure Scanner Header**:
   Configure your scanner script / HTTP proxy to append the token to all `/api/v1/*` requests:

   ```http
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## 4. Platform Admin Authentication

Admin endpoints (`/api/v1/admin/*`) require platform admin authorization tokens:

1. **Admin Login Request**:

   ```http
   POST /api/v1/admin/login
   Content-Type: application/json

   {
     "email": "admin@mbbs.net",
     "password": "<ADMIN_PASSWORD>"
   }
   ```

2. **Configure Scanner Admin Header**:

   ```http
   Authorization: Bearer <ADMIN_JWT_TOKEN>
   ```

---

## 5. OWASP ZAP / Burp Suite Setup Instructions

### OWASP ZAP:
1. Open **Tools → Options → Replacer**.
2. Add a rule:
   - **Match Header**: `Authorization`
   - **Replacement String**: `Bearer <YOUR_JWT_TOKEN>`
   - **URL Pattern**: `https://api.mbbs.net/api/v1/.*`

### Burp Suite:
1. Open **Extensions / Match and Replace**.
2. Add rule for Request Header:
   - **Header**: `Authorization`
   - **Value**: `Bearer <YOUR_JWT_TOKEN>`
