# GameHub

GameHub is a small game-discovery site with account registration, sign-in, and a private wishlist for each account.

## Run locally

Requires Node.js 22.5 or newer. The server uses Node's built-in SQLite module, so there are no npm packages to install.

```sh
node server.mjs
```

Open <http://localhost:3000>. The first run creates `data/gamehub.sqlite` automatically. Set `PORT` to change the port or `DATABASE_PATH` to store the database elsewhere.

## What's included

- Account registration and sign-in with scrypt password hashing.
- HTTP-only session cookies, sign-out, and a "Remember me" option.
- A SQLite database for users, sessions, and per-user wishlist entries.
- Authenticated wishlist endpoints used by the game detail and profile pages.

## Hosting

This project now needs a Node.js host; GitHub Pages can only serve the static files and cannot run the API or SQLite database. Deploy the repository to a Node.js service and attach persistent writable storage for the SQLite file. Set `DATABASE_PATH` to a file on that storage and `NODE_ENV=production` so session cookies use HTTPS. If the service runs behind a trusted reverse proxy and supplies `X-Forwarded-For`, set `TRUST_PROXY=true` for per-client sign-in throttling. Back up the database file as part of the host's storage plan.

The existing catalog and game artwork remain static demo data in `js/data.js`. Password reset and social sign-in are not enabled because they require an email or identity-provider setup.
