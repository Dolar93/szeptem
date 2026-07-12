# Wdrożenie na VPS (OVH) — instrukcja krok po kroku

Czas: ~30 minut. Zakładam VPS z Ubuntu 24.04 (najtańszy VLE-2 wystarczy na start).

## 1. Kup VPS i domenę (OVH)

1. ovhcloud.com → VPS → najtańszy plan, lokalizacja: Warszawa (WAW).
2. Domena .pl w tym samym panelu (Web Cloud → Domeny).
3. **Najpierw wyślij ticket o adult content** — tekst w `docs/platnosci-hosting.md` pkt A.

## 2. Skieruj domenę na serwer

Panel OVH → Domeny → Twoja domena → Strefa DNS:
- rekord `A` → `@` → IP Twojego VPS (jest w mailu powitalnym VPS)
- rekord `A` → `www` → to samo IP

## 3. Zaloguj się na serwer i zainstaluj Caddy

Windows: otwórz PowerShell i wpisz (IP i hasło z maila OVH):

```
ssh ubuntu@TWOJE_IP
```

Potem na serwerze (wklej całość):

```bash
sudo apt update && sudo apt install -y caddy git
sudo git clone https://github.com/Dolar93/szeptem /var/www/szeptem
sudo cp /var/www/szeptem/deploy/Caddyfile /etc/caddy/Caddyfile
sudo sed -i 's/TWOJA-DOMENA.pl/faktyczna-domena.pl/g' /etc/caddy/Caddyfile   # ← podmień!
sudo systemctl reload caddy
```

Gotowe — Caddy sam wystawi certyfikat HTTPS (Let's Encrypt). Strona działa
na https://twoja-domena.pl po 1–2 minutach od ustawienia DNS.

## 4. Aktualizacje strony (po każdej zmianie w repo)

```bash
ssh ubuntu@TWOJE_IP "cd /var/www/szeptem && sudo git pull"
```

Jedna komenda. (Docelowo ustawimy auto-deploy z GitHuba — GitHub Actions,
zrobię to, gdy będzie serwer.)

## 5. Po wdrożeniu — 3 rzeczy

1. W `js/app.js` ustaw `FORM_ENDPOINT` (instrukcja w `docs/DO-ZROBIENIA.md` pkt 3).
2. W `index.html` podmień `og:url` i `og:image` na nową domenę.
3. Sprawdź https://twoja-domena.pl/?demo — tryb czystego nagrywania rolek.
