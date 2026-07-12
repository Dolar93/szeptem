// szeptem — seed bazy danymi demo z js/data.js (bez duplikowania danych)
// Uruchomienie: node server/seed.js
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const db = require("./db");

// js/data.js to zwykłe consty przeglądarkowe — wykonujemy je w piaskownicy
// i odbieramy wartości jako wynik ostatniego wyrażenia
const code = fs.readFileSync(path.join(__dirname, "..", "js", "data.js"), "utf8");
const { SELLERS, LISTINGS, SHORTS } = vm.runInNewContext(
  code + ";({ SELLERS, LISTINGS, SHORTS })", {});

const DEMO_PASSWORD = "demo1234"; // konta demo — do wywalenia przed produkcją

const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (email, handle, pass_hash, salt, role, verified, bio, sub_price)
  VALUES (?, ?, ?, ?, 'seller', 1, ?, ?)`);
const getUserId = db.prepare("SELECT id FROM users WHERE handle = ?");
const insertListing = db.prepare(`
  INSERT OR IGNORE INTO listings (id, seller_id, title, cat, price, descr, status)
  VALUES (?, ?, ?, ?, ?, '', 'live')`);
const insertShort = db.prepare(`
  INSERT OR IGNORE INTO shorts (id, seller_id, listing_id, caption, dur, status, views, likes)
  VALUES (?, ?, ?, ?, ?, 'live', ?, ?)`);

const ids = {};
for (const [key, s] of Object.entries(SELLERS)) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(DEMO_PASSWORD, salt, 64).toString("hex");
  insertUser.run(`${key}@demo.szeptem.local`, s.handle, hash, salt, s.bio, s.sub || null);
  ids[key] = getUserId.get(s.handle).id;
}

for (const l of LISTINGS) insertListing.run(l.id, ids[l.seller], l.title, l.cat, l.price);
for (const sh of SHORTS) insertShort.run(sh.id, ids[sh.seller], sh.listing, sh.caption, sh.dur, sh.views, sh.likes);

const counts = {
  users: db.prepare("SELECT COUNT(*) c FROM users").get().c,
  listings: db.prepare("SELECT COUNT(*) c FROM listings").get().c,
  shorts: db.prepare("SELECT COUNT(*) c FROM shorts").get().c,
};
console.log("Seed OK:", counts);
