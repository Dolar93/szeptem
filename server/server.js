// szeptem — serwer fazy 2: statyczna strona + API (konta, sesje, zapisy, zgłoszenia)
// Zero zależności npm: node:http, node:sqlite, node:crypto.
// Uruchomienie:  node server/server.js   (opcjonalnie PORT=xxxx, domyślnie 4180)
"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const db = require("./db");

const PORT = Number(process.env.PORT) || 4180;
const ROOT = path.join(__dirname, "..");
const SESSION_DAYS = 30;

// ── pomocnicze ──

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json",
  ".txt": "text/plain; charset=utf-8",
  ".ico": "image/x-icon",
};

function json(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", c => {
      data += c;
      if (data.length > 64 * 1024) { reject(new Error("body too large")); req.destroy(); }
    });
    req.on("end", () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch (e) { reject(new Error("invalid json")); }
    });
    req.on("error", reject);
  });
}

function getCookies(req) {
  const out = {};
  (req.headers.cookie || "").split(";").forEach(part => {
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  });
  return out;
}

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

function createSession(res, userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
  db.prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)")
    .run(token, userId, expires.toISOString());
  res.setHeader("Set-Cookie",
    `sid=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}`);
}

function currentUser(req) {
  const sid = getCookies(req).sid;
  if (!sid) return null;
  const row = db.prepare(`
    SELECT u.id, u.email, u.handle, u.role, u.verified
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token = ? AND s.expires_at > datetime('now')`).get(sid);
  return row || null;
}

// ── API ──

const routes = {

  "GET /api/health": (req, res) => {
    json(res, 200, { ok: true, ts: new Date().toISOString() });
  },

  "POST /api/register": async (req, res) => {
    const b = await readBody(req);
    const email = String(b.email || "").trim().toLowerCase();
    const handle = String(b.handle || "").trim();
    const password = String(b.password || "");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json(res, 400, { error: "Nieprawidłowy e-mail" });
    if (handle.length < 3 || handle.length > 30) return json(res, 400, { error: "Pseudonim: 3–30 znaków" });
    if (password.length < 8) return json(res, 400, { error: "Hasło: minimum 8 znaków" });
    const role = b.role === "seller" ? "seller" : "buyer";
    const salt = crypto.randomBytes(16).toString("hex");
    try {
      const info = db.prepare(
        "INSERT INTO users (email, handle, pass_hash, salt, role) VALUES (?, ?, ?, ?, ?)")
        .run(email, handle, hashPassword(password, salt), salt, role);
      createSession(res, Number(info.lastInsertRowid));
      json(res, 201, { id: Number(info.lastInsertRowid), handle, role });
    } catch (e) {
      json(res, 409, { error: "E-mail albo pseudonim jest już zajęty" });
    }
  },

  "POST /api/login": async (req, res) => {
    const b = await readBody(req);
    const email = String(b.email || "").trim().toLowerCase();
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) return json(res, 401, { error: "Nieprawidłowy e-mail lub hasło" });
    const hash = hashPassword(String(b.password || ""), user.salt);
    const ok = crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(user.pass_hash));
    if (!ok) return json(res, 401, { error: "Nieprawidłowy e-mail lub hasło" });
    createSession(res, user.id);
    json(res, 200, { id: user.id, handle: user.handle, role: user.role, verified: !!user.verified });
  },

  "POST /api/logout": (req, res) => {
    const sid = getCookies(req).sid;
    if (sid) db.prepare("DELETE FROM sessions WHERE token = ?").run(sid);
    res.setHeader("Set-Cookie", "sid=; Path=/; HttpOnly; Max-Age=0");
    json(res, 200, { ok: true });
  },

  "GET /api/me": (req, res) => {
    const user = currentUser(req);
    if (!user) return json(res, 401, { error: "Nie jesteś zalogowany" });
    json(res, 200, user);
  },

  "GET /api/listings": (req, res) => {
    const rows = db.prepare(`
      SELECT l.id, l.title, l.cat, l.price, l.descr, u.handle AS seller, u.verified
      FROM listings l JOIN users u ON u.id = l.seller_id
      WHERE l.status = 'live' ORDER BY l.id DESC`).all();
    json(res, 200, rows);
  },

  "GET /api/shorts": (req, res) => {
    const rows = db.prepare(`
      SELECT s.id, s.caption, s.dur, s.views, s.likes, s.listing_id, u.handle AS seller
      FROM shorts s JOIN users u ON u.id = s.seller_id
      WHERE s.status = 'live' ORDER BY s.id DESC`).all();
    json(res, 200, rows);
  },

  "POST /api/signups": async (req, res) => {
    const b = await readBody(req);
    const typ = b._typ === "pionierka" ? "pionierka" : "kupujacy";
    db.prepare("INSERT INTO signups (typ, payload) VALUES (?, ?)")
      .run(typ, JSON.stringify(b));
    json(res, 201, { ok: true });
  },

  "GET /api/signups": (req, res) => {
    // podgląd zgłoszeń — tylko dla zalogowanej sprzedawczyni-admina (na razie: seller)
    const user = currentUser(req);
    if (!user || user.role !== "seller") return json(res, 403, { error: "Brak dostępu" });
    json(res, 200, db.prepare("SELECT * FROM signups ORDER BY id DESC").all());
  },

  "POST /api/reports": async (req, res) => {
    const b = await readBody(req);
    const url = String(b.url || "").slice(0, 500);
    const reason = String(b.reason || "").slice(0, 2000);
    if (!url || reason.length < 5) return json(res, 400, { error: "Podaj adres treści i powód" });
    db.prepare("INSERT INTO reports (url, reason, contact) VALUES (?, ?, ?)")
      .run(url, reason, String(b.contact || "").slice(0, 200));
    json(res, 201, { ok: true });
  },
};

// ── statyczna strona ──

function serveStatic(req, res, urlPath) {
  let p = decodeURIComponent(urlPath.split("?")[0]);
  if (p === "/") p = "/index.html";
  // dokumenty robocze i pliki serwera nie są publiczne
  if (/^\/(docs|deploy|server|\.git)/.test(p)) { res.writeHead(404); return res.end("404"); }
  const file = path.normalize(path.join(ROOT, p));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end("403"); }
  fs.readFile(file, (err, data) => {
    if (err) {
      fs.readFile(path.join(ROOT, "404.html"), (e2, nf) => {
        res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
        res.end(e2 ? "404" : nf);
      });
      return;
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const key = `${req.method} ${req.url.split("?")[0]}`;
  try {
    if (routes[key]) await routes[key](req, res);
    else if (req.url.startsWith("/api/")) json(res, 404, { error: "Nie ma takiego endpointu" });
    else if (req.method === "GET") serveStatic(req, res, req.url);
    else { res.writeHead(405); res.end(); }
  } catch (e) {
    json(res, 400, { error: e.message || "Błąd żądania" });
  }
});

server.listen(PORT, () => {
  console.log(`szeptem server: http://localhost:${PORT}`);
  console.log(`API health:     http://localhost:${PORT}/api/health`);
});
