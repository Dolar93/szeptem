// szeptem — warstwa bazy danych
// SQLite wbudowane w Node (node:sqlite, Node 22.5+) — zero zależności npm.
"use strict";

const { DatabaseSync } = require("node:sqlite");
const path = require("node:path");

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "szeptem.db");
const db = new DatabaseSync(DB_PATH);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    email      TEXT UNIQUE NOT NULL,
    handle     TEXT UNIQUE NOT NULL,
    pass_hash  TEXT NOT NULL,
    salt       TEXT NOT NULL,
    role       TEXT NOT NULL DEFAULT 'buyer',   -- buyer | seller
    verified   INTEGER NOT NULL DEFAULT 0,      -- 1 = KYC zaliczone
    bio        TEXT NOT NULL DEFAULT '',
    sub_price  INTEGER,                         -- cena subskrypcji (gr? na razie zł)
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token      TEXT PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS listings (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    seller_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title      TEXT NOT NULL,
    cat        TEXT NOT NULL,
    price      INTEGER NOT NULL,                -- zł
    descr      TEXT NOT NULL DEFAULT '',
    status     TEXT NOT NULL DEFAULT 'live',    -- draft | mod | live | removed
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS shorts (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    seller_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id INTEGER REFERENCES listings(id) ON DELETE SET NULL,
    caption    TEXT NOT NULL,
    dur        INTEGER NOT NULL DEFAULT 8,
    status     TEXT NOT NULL DEFAULT 'mod',     -- mod | live | removed
    views      INTEGER NOT NULL DEFAULT 0,
    likes      INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS messages (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    from_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body       TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS signups (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    typ        TEXT NOT NULL,                   -- pionierka | kupujacy
    payload    TEXT NOT NULL,                   -- JSON zgłoszenia
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS reports (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    url        TEXT NOT NULL,
    reason     TEXT NOT NULL,
    contact    TEXT NOT NULL DEFAULT '',
    status     TEXT NOT NULL DEFAULT 'new',     -- new | reviewing | closed
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

module.exports = db;
