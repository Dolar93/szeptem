# Płatności + hosting — gotowe teksty i checklisty

## A. Ticket do OVH (wyślij PRZED zakupem VPS — miej zgodę na piśmie)

Panel OVH → Pomoc → Utwórz zgłoszenie. Tekst (EN działa szybciej):

> **Subject:** Adult content policy confirmation before purchase
>
> Hello, I am planning to purchase a VPS to host a legal adult marketplace
> (18+ content: sale of photos/videos and worn clothing by ID-verified adult
> sellers, Polish market, fully compliant with Polish and EU law, with age
> verification and content moderation). Before purchasing, I would like to
> confirm in writing that hosting legal adult content is permitted on OVH VPS
> under your Terms of Service. Can you confirm? Thank you.

Alternatywy, gdyby OVH odmówiło: MojoHost, ViceTemple (hosting wyspecjalizowany w adult, płatność kartą/krypto).

## B. Aplikacja do Segpay (priorytet — najszybsza akceptacja, 24–72 h po komplecie)

Formularz: segpay.com → „Get Started" / merchant application.

**Dokumenty do przygotowania (checklista):**
- [ ] wpis CEIDG / KRS (firma zarejestrowana)
- [ ] skan dowodu osobistego / paszportu właściciela
- [ ] numer konta firmowego (IBAN)
- [ ] domena (musisz już mieć — wpisz docelową, nie github.io)
- [ ] działająca strona z: regulaminem, polityką prywatności, polityką zwrotów, cennikiem, stroną kontaktu/billing support (drafty w `docs/prawne/` — po przeglądzie prawnika wystawię je jako podstrony)
- [ ] opis biznesu (gotowiec niżej)

**Opis biznesu (EN, wklej do aplikacji):**

> Szeptem is a Polish-language adult marketplace connecting ID-verified adult
> sellers (18+) with adult buyers. Sellers offer digital content (photos,
> videos) and worn apparel. All sellers pass mandatory ID + biometric age
> verification before listing. All content is human-moderated before
> publication. Prohibited content policy enforced (no third parties without
> documented consent, zero tolerance for CSAM, no escort/prostitution
> services). Average transaction: 30–80 EUR. Market: Poland/EU. Payment flows:
> one-time purchases; payouts to sellers after platform commission.

**Pytania, które zadaj w pierwszym mailu:**
1. Fees + rolling reserve dla nowego polskiego merchanta (marketplace model)?
2. Czy wspieracie split payouts do sprzedawców, czy tylko payout do platformy?
3. Deskryptor na wyciągu — jakie mamy opcje?
4. Wymogi co do strony przed aprobatą (checklist)?

## C. Aplikacja do CCBill (równolegle — plan B)

ccbill.com → Sign Up → Merchant. Te same dokumenty. Uwaga: opłata rejestracyjna
Visa/MC dla high-risk: 500–1000 USD/rok. Prowizje 10,8–14,5%.

## D. Konto firmowe — jak rozmawiać z bankiem

Zakładając konto powiedz wprost: „platforma internetowa e-commerce, kategoria
treści dla dorosłych, płatności obsługuje zagraniczny licencjonowany operator
(Segpay/CCBill), na konto wpływają wypłaty od operatora płatności". Banki
w PL, które w praktyce są spokojniejsze dla e-commerce: `[sprawdź aktualnie:
mBank firmowe / Nest / Velo]`. Jeśli bank odmówi — nie kombinuj na koncie
prywatnym (zamrożenie środków); spróbuj w kolejnym banku lub EMI (np. Wise
Business — uwaga: Wise nie lubi adult, sprawdź ToS; bezpieczniej klasyczny bank).

## E. KYC sprzedawczyń (do fazy 2)

- **Sumsub** — od ~1,35 USD/weryfikacja, ma gotowy flow „adult industry", API proste.
- **Veriff** — podobnie, ~1–2 EUR.
- Wybierz Sumsub, chyba że Segpay narzuci swojego dostawcę (zapytaj w mailu — pkt B.4).

## F. Weryfikacja wieku kupujących (obowiązek ustawowy — na radarze)

Rządowy projekt ustawy (przyjęty 06.2026): obowiązkowa weryfikacja wieku,
EUDI Wallet do końca 2026, kary do 1 mln zł. Do wdrożenia w fazie 2/3:
dostawcy przejściowi: Yoti / AgeGO / Ondato. Na soft-launch wystarczy
bramka oświadczeniowa (jest na stronie), bo nie sprzedajemy jeszcze treści.
