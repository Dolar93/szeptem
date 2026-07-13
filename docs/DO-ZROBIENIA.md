# TWOJA lista — tylko to, czego nie mogę zrobić za Ciebie

Kolejność ma znaczenie. Szacowany Twój czas łącznie: ~4–6 godzin.

> **Decyzja: startujemy bez prawnika.** Oszczędza czas i 500–1500 zł, ale zostają
> dwa punkty do samodzielnego pilnowania — patrz punkt 4 niżej. Jeśli po starcie
> pojawi się realny obrót, wróć do tematu (albo chociaż jedna płatna konsultacja
> 30 min, ~200–400 zł, tylko pod te dwa punkty).

## 1. Dzień 1 — zakupy (≈45 min)

- [ ] OVH: wyślij ticket o adult content (gotowy tekst: `docs/platnosci-hosting.md` pkt A)
- [ ] OVH: kup VPS (najtańszy, Warszawa) + domenę .pl
- [ ] Wykonaj `deploy/INSTRUKCJA-VPS.md` (30 min, kopiuj-wklej) — albo podeślij mi
      dostęp SSH, a zrobię to ja

## 2. Dzień 1–2 — firma (≈1 godz. online)

- [ ] CEIDG: załóż JDG (PKD 63.12.Z + 47.91.Z), online przez profil zaufany
- [ ] Konto firmowe w banku — jak rozmawiać: `docs/platnosci-hosting.md` pkt D

## 3. Formularze zapisów (≈10 min)

- [ ] Załóż darmowe konto na formspree.io → New form → skopiuj adres
      (wygląda tak: `https://formspree.io/f/abcd1234`)
- [ ] Wklej go w `js/app.js` w linii `const FORM_ENDPOINT = "";` (między cudzysłowy)
      → od tej chwili zgłoszenia pionierek i zapisy kupujących przychodzą Ci na maila

## 3b. E-maile w dokumentach (5 min, po założeniu skrzynek na domenie)

- [ ] W plikach `regulamin.html`, `prywatnosc.html`, `zwroty.html`, `tresci.html`,
      `kontakt.html` podmień żółte znaczniki `[e-mail]` na prawdziwe adresy
      (wyszukaj w plikach frazę `legal-todo`) — albo podeślij mi adresy, zrobię ja

## 4. Bez prawnika — dwa punkty do samodzielnego pilnowania

Dokumenty w `docs/prawne/` i podstrony (`regulamin.html` itd.) publikujemy
„as-is" po uzupełnieniu danych firmy. Dwa miejsca z realnym ryzykiem, które
prawnik by domknął — trzymaj je z tyłu głowy:

- [ ] **RODO — dane z weryfikacji (KYC).** Nie przechowuj kopii dowodów/selfie
      na własnym serwerze — niech to robi wyłącznie zewnętrzny dostawca KYC
      (Sumsub/Veriff). U siebie trzymaj tylko wynik: `verified = tak/nie`.
      To już tak jest zaprojektowane w `server/db.js` — nie zmieniaj tego.
- [ ] **JDG vs sp. z o.o.** JDG = odpowiedzialność całym majątkiem osobistym.
      Świadoma decyzja, nie przeoczenie — jeśli obrót zacznie rosnąć, rozważ
      przejście na sp. z o.o. (można założyć online przez S24 w ~tydzień).

Gdy zechcesz wrócić do tematu prawnika: folder `docs/prawne/` ma gotowe
5 draftów z zaznaczonymi `[TODO]` — wystarczy jedna wizyta.

## 4b. Auto-deploy (5 min, po zakupie VPS)

- [ ] GitHub → Settings → Secrets and variables → Actions → dodaj:
      zmienną `DEPLOY_ENABLED=true` oraz sekrety `VPS_HOST`, `VPS_USER`,
      `VPS_SSH_KEY` (szczegóły w komentarzu w `.github/workflows/deploy.yml`)
      → od tej chwili każdy push sam aktualizuje stronę na serwerze

## 5. Płatności (30 min wypełniania, potem czekanie)

- [ ] Po założeniu firmy: aplikacja do Segpay i CCBill równolegle
      (checklista dokumentów + gotowy opis biznesu po angielsku + pytania:
      `docs/platnosci-hosting.md` pkt B i C)

## 6. Social media (Twoja codzienna robota)

- [ ] Załóż konta TikTok wg strategii: `docs/marketing-tiktok.md`
- [ ] Nagrywaj wg gotowych scenariuszy (8 sztuk + kalendarz tygodnia w tym samym pliku)
- [ ] Ekran nagrywaj z adresu `twoja-domena.pl/?demo` (czysty kadr bez bramki)

## Co już NIE jest Twoją pracą (zrobione)

- Strona w trybie soft-launch: baner startowy, oferta pionierek (0%/3 mies.),
  formularz zgłoszeń dla sprzedawczyń, lista oczekujących kupujących
- OG-meta + obrazek podglądu linka + favicon (ładnie wygląda w DM/bio)
- Tryb `?demo` do nagrywania rolek
- 5 draftów dokumentów prawnych (do przeglądu, nie do pisania od zera)
- Teksty aplikacji do procesorów, ticket do OVH, rozmowa z bankiem
- 8 scenariuszy rolek + strategia kont + kalendarz
- Instrukcja wdrożenia VPS + konfiguracja serwera (Caddyfile)
