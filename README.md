# szeptem. — prototyp marketplace 18+

Klikalny prototyp polskiego marketplace'u do sprzedaży zdjęć stóp i noszonej
bielizny. Czysty HTML/CSS/JS, bez budowania i zależności.

## Uruchomienie

```
npx serve -l 4174 .
```

(z katalogu projektu `PROJEKTY\szeptem`) i otwórz `http://localhost:4174`.

## Co odwzorowuje

- **Bramka 18+** — potwierdzenie pełnoletności przy wejściu (sessionStorage)
- **Start** — hero z propozycją wartości, pasek liczb, zwiastun zajawek,
  4 najnowsze oferty
- **Zajawki (shorts)** — pionowy feed krótkich wideo promocyjnych w stylu
  TikToka: scroll-snap, autoodtwarzanie z paskiem postępu i autoprzejściem,
  polubienia, licznik wyświetleń, znak wodny na „wideo" (animowany atłas),
  klik w wideo → profil sprzedawczyni, złoty CTA → modal zakupu oferty
- **Mock logowania** — „Zaloguj" tworzy sesję (sessionStorage); zalogowany
  użytkownik startuje w feedzie zajawek, w nagłówku chip z pseudonimem
- **Panel sprzedawczyni** — „Załóż konto sprzedawczyni" loguje na konto demo
  (Malina): statystyki (sprzedaże, 85% obrotu, wyświetlenia zajawek),
  formularz nowej zajawki (opis + licznik znaków, promowana oferta, długość,
  losowany „atłas" z podglądem), mock moderacji (4 s) i lista własnych
  zajawek z usuwaniem; opublikowane trafiają na górę feedu (localStorage);
  wykres 7 dni „wyświetlenia → wejścia na profil" + lejek konwersji
  (paleta serii zwalidowana pod CVD na tle panelu)
- **Katalog** — 12 przykładowych ofert, filtry kategorii (stópki / bielizna /
  skarpetki / zestawy / video), wyszukiwarka (tytuł + sprzedawczyni)
  i sortowanie (cena, popularność, najnowsze)
- **Strona oferty** — galeria „za zasłoną" z 4 podglądami, opis, cena,
  opinie kupujących, karta sprzedawczyni, oferty powiązane
- **Wiadomości 1:1** — mock czatu ze sprzedawczyniami: lista rozmów,
  dymki, automatyczne odpowiedzi po ~2 s, wejście z profilu i strony oferty
- **Obserwowanie + powiadomienia** — przycisk „Obserwuj" na profilu,
  dzwonek w nagłówku z licznikiem nieprzeczytanych, mock powiadomień
  (nowa zajawka obserwowanej, nowa wiadomość, wynik moderacji)
- **Profil sprzedawczyni** — pseudonim, bio, statystyki, jej oferty
- **Modal zakupu** — mock płatności (karta / portfel / krypto) z komunikatem
  o neutralnej nazwie na wyciągu
- **Dla sprzedawczyń** — 3 kroki: weryfikacja → oferty → wypłata 85%
- **Bezpieczeństwo** — KYC, anonimowość, znaki wodne, moderacja, RODO

## Sygnatura wizualna

Design system „atłasowa noc": śliwkowa czerń `#191019`, atłasowy róż `#d695ac`,
szampańskie złoto `#d8b07e`. Fraunces (italic display) + Instrument Sans.
Zamiast zdjęć — **karty za zasłoną**: abstrakcyjne „atłasowe" gradienty
(deterministyczne per seed) pod szkłem `backdrop-filter`, hover lekko uchyla
zasłonę. To jednocześnie estetyka i mechanika produktu (podgląd = paywall).

## Struktura

| Plik | Rola |
|---|---|
| `index.html` | wszystkie widoki + bramka 18+ + modal |
| `css/style.css` | design system, karty-zasłony, responsywność (dolny pasek mobile) |
| `js/data.js` | fikcyjne sprzedawczynie, oferty i zajawki (SHORTS) |
| `js/app.js` | nawigacja SPA, filtry, profil, modal zakupu, feed zajawek, mock logowania, polska odmiana liczebników |

## Czego świadomie tu nie ma (decyzje na później)

- Prawdziwych płatności — **kluczowe ryzyko projektu**: polskie bramki
  (PayU, Przelewy24, Tpay, BLIK) nie obsługują treści 18+; realne opcje to
  CCBill / Segpay / Verotel / krypto
- Kont użytkowników, uploadu, moderacji, KYC — wymaga backendu
- Prawdziwych zdjęć i wideo — placeholder „za zasłoną" oraz animowany atłas
  w zajawkach są celowe; docelowo zajawki to pliki `<video>` (HLS) po moderacji
