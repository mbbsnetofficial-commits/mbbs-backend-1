# Dokploy deployment

This application listens on `0.0.0.0:3000` and exposes:

- `/` — browser-friendly API status
- `/health` — container and proxy health check
- `/api-docs` — Swagger documentation

## 1. Create the application

In Dokploy, create an **Application**, connect this repository, and select the
`main` branch.

Use these build settings:

| Setting | Value |
| --- | --- |
| Build type | Dockerfile |
| Dockerfile | `Dockerfile` |
| Build context/path | `/` |

The Dockerfile installs the locked dependencies, exposes port `3000`, starts
the application with `npm start`, and checks `/health`.

## 2. Add environment variables

Open **Application → Environment** and add the production values from
`config.env.example`. At minimum, startup requires:

```env
NODE_ENV=production
PORT=3000
CONNECTION_STRING=mongodb+srv://...
BLOG_DATABASE_NAME=blog
```

`BLOG_CONNECTION_STRING` is optional when the blog database uses the same
MongoDB cluster as `CONNECTION_STRING`.

Also configure the authentication secrets and service credentials used by the
enabled API features. Never commit production secrets to the repository.

## 3. Permit the database connection

In MongoDB Atlas, allow the Dokploy server's public IP in **Network Access**.
Confirm that the database user can access both the main database and the blog
database.

The application intentionally connects to MongoDB before accepting traffic. A
missing, rejected, or unreachable MongoDB connection will stop the container,
and Dokploy will display `502 Bad Gateway`.

## 4. Configure the domain

Open **Application → Domains** and use:

| Setting | Value |
| --- | --- |
| Host | Your backend domain |
| Path | `/` |
| Container port | `3000` |
| HTTPS | Enabled |

Port `3000` is the internal container port. Do not set the domain target to
`80`, `443`, or a frontend port.

## 5. Deploy and verify

Deploy the application and inspect its runtime logs. A successful startup ends
with messages similar to:

```text
NEET database connected: ...
Blog database connected: ...
Server started on 0.0.0.0:3000
```

Then open:

```text
https://YOUR_BACKEND_DOMAIN/
https://YOUR_BACKEND_DOMAIN/health
```

Both URLs should return HTTP `200` with `"status": "success"`.

## Diagnosing a 502

Use the first matching condition:

| Runtime log/result | Resolution |
| --- | --- |
| `CONNECTION_STRING is not configured` | Add it in Dokploy Environment and redeploy |
| MongoDB timeout or server-selection error | Allow the Dokploy IP in Atlas and verify DNS/network access |
| MongoDB authentication error | Correct the username/password and URL-encode special password characters |
| Logs show `Server started on 0.0.0.0:3000`, but domain gives 502 | Change the Dokploy domain's container port to `3000` |
| Container is marked unhealthy | Confirm `/health` works inside the container and `PORT=3000` |
| Root works but frontend API requests fail | Set `FRONTEND_URL` to the exact frontend origin and verify the frontend backend URL |
