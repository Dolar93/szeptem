# szeptem — serwer (faza 2)

Fundament backendu pod pełną wersję. **Zero zależności npm** — używa wbudowanych
modułów Node 22.5+ (`node:http`, `node:sqlite`, `node:crypto`).

## Uruchomienie

```
node server/seed.js      # jednorazowo: baza + dane demo
node server/server.js    # serwer: strona + API na http://localhost:4180
```

Zmienne: `PORT` (domyślnie 4180), `DB_PATH` (domyślnie `server/szeptem.db`).
Konta demo sprzedawczyń: `malina@demo.szeptem.local` … hasło `demo1234`
(usunąć przed produkcją).

## Co już działa

| Endpoint | Opis |
|---|---|
| `GET /api/health` | status serwera |
| `POST /api/register` | konto (e-mail, hasło ≥8, pseudonim; hasła: scrypt+salt) |
| `POST /api/login` / `POST /api/logout` | sesja w cookie HttpOnly (30 dni) |
| `GET /api/me` | zalogowany użytkownik |
| `GET /api/listings` | oferty z bazy (join ze sprzedawczynią) |
| `GET /api/shorts` | zajawki z bazy |
| `POST /api/signups` | zapisy pionierek / listy oczekujących |
| `GET /api/signups` | podgląd zgłoszeń (rola seller) |
| `POST /api/reports` | zgłoszenia treści (DSA) |

Serwer podaje też całą statyczną stronę (z blokadą `/docs`, `/deploy`,
`/server`) — na VPS może zastąpić `serve`/Caddy file_server (Caddy wtedy
robi tylko HTTPS reverse-proxy).

**Zapisy bez Formspree:** przy działającym serwerze ustaw w `js/app.js`
`FORM_ENDPOINT = "/api/signups"` — formularze piszą prosto do bazy,
podgląd: `GET /api/signups` po zalogowaniu na konto seller.

## Czego tu jeszcze nie ma (kolejność wdrażania fazy 2)

1. Upload plików (zdjęcia/wideo) + kolejka moderacji + znak wodny
2. Webhook KYC (Sumsub/Veriff) → `users.verified = 1`
3. Webhook płatności (Segpay/CCBill) → tabela `orders` + odblokowanie treści
4. Czat na bazie tabeli `messages` (long-polling wystarczy na start)
5. Wypłaty (tabela `payouts`) i panel administracyjny moderacji
6. Rate limiting + CSRF token dla POST-ów (przed publicznym startem!)
