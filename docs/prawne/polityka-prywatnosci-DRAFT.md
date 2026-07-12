# Polityka prywatności szeptem.pl — DRAFT

> ⚠️ **DRAFT do weryfikacji przez prawnika (RODO!). Nie publikować bez przeglądu.**

## 1. Administrator danych

`[TODO: pełna nazwa firmy, adres, NIP]`. Kontakt w sprawach danych: `[TODO: e-mail]`.
`[TODO: ocenić z prawnikiem obowiązek wyznaczenia IOD — przy danych wrażliwych na dużą skalę prawdopodobnie TAK]`

## 2. Jakie dane przetwarzamy i po co

| Dane | Cel | Podstawa prawna | Retencja |
|---|---|---|---|
| E-mail, pseudonim, hasło (hash) | prowadzenie konta | art. 6 ust. 1 lit. b RODO (umowa) | do usunięcia konta + okres roszczeń |
| Dane z weryfikacji tożsamości Sprzedających (dokument, selfie, data urodzenia) | weryfikacja wieku i tożsamości — wymóg bezpieczeństwa platformy | art. 6 ust. 1 lit. c i f; `[TODO: prawnik — art. 9, wyraźna zgoda]` | `[TODO: minimalny okres — dane trzymane u dostawcy KYC, nie na naszych serwerach]` |
| Dane transakcji (kwoty, id ofert) | rozliczenia, księgowość | art. 6 ust. 1 lit. c | 5 lat (przepisy podatkowe) |
| Treść wiadomości w Serwisie | świadczenie usługi czatu, bezpieczeństwo | art. 6 ust. 1 lit. b i f | do usunięcia konta |
| Logi techniczne, IP | bezpieczeństwo, obrona roszczeń | art. 6 ust. 1 lit. f | `[TODO: np. 12 mies.]` |
| E-mail z listy oczekujących | jednorazowe powiadomienie o starcie | art. 6 ust. 1 lit. a (zgoda) | do wysłania powiadomienia lub cofnięcia zgody |

**Zasada minimalizacji:** kupujący nie podają imienia i nazwiska; sprzedające występują publicznie wyłącznie pod pseudonimem. Dane KYC przetwarza wyspecjalizowany dostawca (`[TODO: nazwa]`) i nie są one widoczne dla innych użytkowników ani łączone z publicznym profilem poza flagą „zweryfikowana".

## 3. Szczególna kategoria danych

Charakter Serwisu sprawia, że sam fakt posiadania konta może ujawniać dane dotyczące seksualności (art. 9 RODO). `[TODO: prawnik — mechanizm wyraźnej zgody przy rejestracji + ocena skutków (DPIA) — przy tej skali i kategorii danych DPIA jest obowiązkowa]`.

## 4. Odbiorcy danych

- dostawca KYC: `[TODO]`
- operator płatności: `[TODO: Segpay/CCBill]`
- hosting: `[TODO: OVH — serwery w UE]`
- księgowość: `[TODO]`
- organy państwowe — wyłącznie na podstawie przepisów prawa.

Nie sprzedajemy danych. Nie prowadzimy marketingu do danych z KYC.

## 5. Prawa użytkownika

Dostęp, sprostowanie, usunięcie, ograniczenie, przenoszenie, sprzeciw, cofnięcie zgody, skarga do PUODO. Realizacja: `[TODO: e-mail]`, termin: 30 dni.

## 6. Bezpieczeństwo

Szyfrowanie transmisji (TLS), hasła wyłącznie w postaci hash (bcrypt/argon2), dane KYC wyłącznie u dostawcy KYC, dostęp do danych ograniczony do niezbędnego minimum, kopie zapasowe szyfrowane. `[TODO: uzupełnić po wdrożeniu backendu]`

## 7. Pliki cookie

Serwis używa wyłącznie niezbędnych plików cookie/localStorage (sesja, bramka wieku, preferencje). Statystyka: `[TODO: jeśli Plausible/Matomo — bez cookie, bez zgody; jeśli GA — baner zgód]`.

## 8. Zmiany polityki

Informacja z 14-dniowym wyprzedzeniem na adres e-mail konta.
