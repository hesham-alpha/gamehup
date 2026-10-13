import { createServer } from "node:http";
import { createReadStream, mkdirSync, statSync } from "node:fs";
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const ROOT = dirname(fileURLToPath(import.meta.url));
const databasePath = resolve(process.env.DATABASE_PATH || resolve(ROOT, "data/gamehub.sqlite"));
const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || "0.0.0.0";
const SESSION_COOKIE = "gamehub_session";
const SESSION_MS = 30 * 24 * 60 * 60 * 1000;
const TEMP_SESSION_MS = 12 * 60 * 60 * 1000;
const MAX_BODY_BYTES = 16 * 1024;

mkdirSync(dirname(databasePath), { recursive: true });

const db = new DatabaseSync(databasePath);
db.exec(`
  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL COLLATE NOCASE UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS sessions_user_id ON sessions(user_id);
  CREATE INDEX IF NOT EXISTS sessions_expires_at ON sessions(expires_at);

  CREATE TABLE IF NOT EXISTS wishlist (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (user_id, game_id)
  );
`);
db.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(Date.now());

const statements = {
  findUserByEmail: db.prepare("SELECT * FROM users WHERE email = ?"),
  findUserById: db.prepare("SELECT id, name, email, created_at FROM users WHERE id = ?"),
  insertUser: db.prepare("INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)"),
  insertSession: db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)"),
  findSession: db.prepare(`
    SELECT users.id, users.name, users.email, users.created_at, sessions.token_hash
    FROM sessions JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ? AND sessions.expires_at > ?
  `),
  deleteSession: db.prepare("DELETE FROM sessions WHERE token_hash = ?"),
  getWishlist: db.prepare("SELECT game_id FROM wishlist WHERE user_id = ? ORDER BY created_at DESC, game_id ASC"),
  addWishlist: db.prepare("INSERT OR IGNORE INTO wishlist (user_id, game_id, created_at) VALUES (?, ?, ?)"),
  removeWishlist: db.prepare("DELETE FROM wishlist WHERE user_id = ? AND game_id = ?")
};

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function userFromRow(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    joined: new Date(row.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
  };
}

function parseCookies(header = "") {
  const cookies = new Map();
  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    const name = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (name) cookies.set(name, value);
  }
  return cookies;
}

function cookieOptions(req) {
  const secure = process.env.NODE_ENV === "production" || requestProtocol(req) === "https";
  return `Path=/; HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}`;
}

function requestProtocol(req) {
  const forwardedProtocol = req.headers["x-forwarded-proto"];
  return typeof forwardedProtocol === "string" && forwardedProtocol
    ? forwardedProtocol.split(",")[0].trim().toLowerCase()
    : req.socket.encrypted ? "https" : "http";
}

function startSession(req, res, userId, remember) {
  const token = randomBytes(32).toString("base64url");
  const expiresIn = remember ? SESSION_MS : TEMP_SESSION_MS;
  statements.insertSession.run(hashToken(token), userId, Date.now() + expiresIn);
  const maxAge = remember ? `; Max-Age=${Math.floor(SESSION_MS / 1000)}` : "";
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=${token}; ${cookieOptions(req)}${maxAge}`);
}

function sendJson(res, status, payload, extraHeaders = {}) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
    ...extraHeaders
  });
  res.end(body);
}

async function readJson(req) {
  const contentType = req.headers["content-type"] || "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    throw new HttpError(415, "Send this request as JSON.");
  }

  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new HttpError(413, "Request is too large.");
    chunks.push(chunk);
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new HttpError(400, "The request could not be read.");
  }
}

function ensureSameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return;
  try {
    const expectedOrigin = new URL(`${requestProtocol(req)}://${req.headers.host}`).origin;
    if (new URL(origin).origin !== expectedOrigin) {
      throw new HttpError(403, "This request was blocked.");
    }
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(403, "This request was blocked.");
  }
}

const authAttempts = new Map();
function limitAuthAttempts(req) {
  const now = Date.now();
  const forwardedFor = req.headers["x-forwarded-for"];
  const proxyAddress = process.env.TRUST_PROXY === "true" && typeof forwardedFor === "string"
    ? forwardedFor.split(",").at(-1).trim()
    : "";
  const key = proxyAddress || req.socket.remoteAddress || "unknown";
  const current = authAttempts.get(key);
  if (!current || current.resetAt <= now) {
    authAttempts.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 });
  } else {
    if (current.count >= 10) throw new HttpError(429, "Too many attempts. Please wait a little and try again.");
    current.count += 1;
  }
  if (authAttempts.size > 5000) {
    for (const [address, record] of authAttempts) {
      if (record.resetAt <= now) authAttempts.delete(address);
    }
  }
}

function authenticate(req) {
  const token = parseCookies(req.headers.cookie).get(SESSION_COOKIE);
  if (!token || token.length > 128) return null;
  const row = statements.findSession.get(hashToken(token), Date.now());
  if (!row) return null;
  return userFromRow(row);
}

async function makePasswordHash(password) {
  const salt = randomBytes(16);
  const digest = await scrypt(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return `scrypt$${salt.toString("hex")}$${Buffer.from(digest).toString("hex")}`;
}

async function verifyPassword(password, encodedHash) {
  const [algorithm, saltHex, digestHex] = encodedHash.split("$");
  if (algorithm !== "scrypt" || !/^[0-9a-f]{32}$/i.test(saltHex || "") || !/^[0-9a-f]{128}$/i.test(digestHex || "")) {
    return false;
  }
  const expected = Buffer.from(digestHex, "hex");
  const actual = Buffer.from(await scrypt(password, Buffer.from(saltHex, "hex"), expected.length, {
    N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024
  }));
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function wishlistIds(userId) {
  return statements.getWishlist.all(userId).map((row) => row.game_id);
}

async function handleApi(req, res, pathname) {
  const method = req.method || "GET";

  if (pathname === "/api/health" && method === "GET") {
    return sendJson(res, 200, { ok: true });
  }

  if (pathname === "/api/auth/me" && method === "GET") {
    const user = authenticate(req);
    return sendJson(res, 200, { user: user ? { id: user.id, name: user.name, email: user.email, joined: user.joined } : null });
  }

  if ((pathname === "/api/auth/register" || pathname === "/api/auth/login") && method === "POST") {
    ensureSameOrigin(req);
    limitAuthAttempts(req);
    const body = await readJson(req);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new HttpError(400, "The request could not be read.");
    }
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const remember = body.remember === true;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      throw new HttpError(400, "Enter a valid email address.");
    }
    if (password.length < 8 || password.length > 128) {
      throw new HttpError(400, "Your password must be between 8 and 128 characters.");
    }

    let row;
    if (pathname.endsWith("/register")) {
      const name = typeof body.name === "string" ? body.name.trim() : "";
      if (name.length < 2 || name.length > 60) {
        throw new HttpError(400, "Your name must be between 2 and 60 characters.");
      }
      if (statements.findUserByEmail.get(email)) {
        throw new HttpError(409, "An account with this email already exists. Sign in instead.");
      }

      try {
        const result = statements.insertUser.run(name, email, await makePasswordHash(password), new Date().toISOString());
        row = statements.findUserById.get(Number(result.lastInsertRowid));
      } catch (error) {
        if (String(error.message).includes("UNIQUE")) {
          throw new HttpError(409, "An account with this email already exists. Sign in instead.");
        }
        throw error;
      }
    } else {
      const account = statements.findUserByEmail.get(email);
      if (!account || !(await verifyPassword(password, account.password_hash))) {
        throw new HttpError(401, "Email or password is incorrect.");
      }
      row = account;
    }

    const user = userFromRow(row);
    startSession(req, res, user.id, remember);
    return sendJson(res, pathname.endsWith("/register") ? 201 : 200, { user });
  }

  if (pathname === "/api/auth/logout" && method === "POST") {
    ensureSameOrigin(req);
    const token = parseCookies(req.headers.cookie).get(SESSION_COOKIE);
    if (token && token.length <= 128) statements.deleteSession.run(hashToken(token));
    return sendJson(res, 200, { ok: true }, { "Set-Cookie": `${SESSION_COOKIE}=; ${cookieOptions(req)}; Max-Age=0` });
  }

  if (pathname === "/api/wishlist" && method === "GET") {
    const user = authenticate(req);
    if (!user) throw new HttpError(401, "Sign in to view your wishlist.");
    return sendJson(res, 200, { gameIds: wishlistIds(user.id) });
  }

  const wishlistMatch = pathname.match(/^\/api\/wishlist\/(\d+)$/);
  if (wishlistMatch && (method === "PUT" || method === "DELETE")) {
    ensureSameOrigin(req);
    const user = authenticate(req);
    if (!user) throw new HttpError(401, "Sign in to update your wishlist.");
    const gameId = Number(wishlistMatch[1]);
    if (!Number.isSafeInteger(gameId) || gameId < 1) throw new HttpError(400, "That game could not be found.");

    if (method === "PUT") {
      statements.addWishlist.run(user.id, gameId, new Date().toISOString());
    } else {
      statements.removeWishlist.run(user.id, gameId);
    }
    return sendJson(res, 200, { gameIds: wishlistIds(user.id) });
  }

  throw new HttpError(404, "API endpoint not found.");
}

const allowedRootPages = new Set(["index.html", "games.html", "game.html", "login.html", "profile.html", "search.html"]);
const allowedAssetFolders = new Set(["css", "js", "images"]);
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

function serveStatic(req, res, pathname) {
  if (req.method !== "GET" && req.method !== "HEAD") throw new HttpError(405, "Method not allowed.");

  let relativePath;
  try {
    relativePath = decodeURIComponent(pathname === "/" ? "/index.html" : pathname).slice(1);
  } catch {
    throw new HttpError(400, "Invalid URL.");
  }

  const parts = relativePath.split("/");
  if (parts.some((part) => !part || part === "." || part === ".." || part.startsWith("."))) {
    throw new HttpError(404, "Page not found.");
  }
  if (parts.length === 1 && !allowedRootPages.has(parts[0])) throw new HttpError(404, "Page not found.");
  if (parts.length > 1 && !allowedAssetFolders.has(parts[0])) throw new HttpError(404, "Page not found.");

  const filePath = resolve(ROOT, relativePath);
  if (!filePath.startsWith(`${ROOT}${sep}`)) throw new HttpError(404, "Page not found.");

  let info;
  try {
    info = statSync(filePath);
  } catch {
    throw new HttpError(404, "Page not found.");
  }
  if (!info.isFile()) throw new HttpError(404, "Page not found.");

  res.writeHead(200, {
    "Content-Type": contentTypes[extname(filePath).toLowerCase()] || "application/octet-stream",
    "Content-Length": info.size,
    "Cache-Control": extname(filePath) === ".html" ? "no-store" : "public, max-age=3600"
  });
  if (req.method === "HEAD") return res.end();
  createReadStream(filePath).pipe(res);
}

const server = createServer(async (req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "DENY");

  let pathname;
  try {
    pathname = new URL(req.url, "http://localhost").pathname;
    if (pathname.startsWith("/api/")) {
      await handleApi(req, res, pathname);
    } else {
      serveStatic(req, res, pathname);
    }
  } catch (error) {
    if (res.headersSent) {
      res.destroy(error);
      return;
    }
    const status = error instanceof HttpError ? error.status : 500;
    if (status === 500) console.error("Request failed:", error);
    sendJson(res, status, { error: error instanceof HttpError ? error.message : "Something went wrong. Please try again." });
  }
});

server.listen(port, host, () => {
  console.log(`GameHub is running at http://localhost:${port}`);
  console.log(`SQLite database: ${databasePath}`);
});

function closeDatabase() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}

process.on("SIGINT", closeDatabase);
process.on("SIGTERM", closeDatabase);
