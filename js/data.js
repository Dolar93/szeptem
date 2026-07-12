// szeptem. — przykładowe dane prototypu (całkowicie fikcyjne)

// ile z 20 miejsc pionierek jest już zajętych — podbijaj ręcznie,
// gdy przychodzą zgłoszenia (uczciwie, bez sztucznego niedoboru)
const PIONEER_TAKEN = 0;

const CATEGORIES = [
  { id: "all",      label: "Wszystko" },
  { id: "stopki",   label: "Stópki" },
  { id: "bielizna", label: "Bielizna" },
  { id: "skarpetki",label: "Skarpetki" },
  { id: "zestawy",  label: "Zestawy" },
  { id: "video",    label: "Video" },
];

const SELLERS = {
  malina: {
    handle: "Malina",
    bio: "Pedicure zawsze świeży, wyobraźnia zawsze bujna. Zestawy tematyczne na zamówienie — napisz, a wymyślimy coś razem.",
    listings: 14, sales: 212, joined: "marzec 2026",
    c1: "#c9748f", c2: "#d8b07e",
  },
  aksamitka: {
    handle: "Aksamitka",
    bio: "Kolekcjonuję koronki od lat — teraz część kolekcji może być Twoja. Każda paczka pakowana w jedwabny papier, dyskretnie.",
    listings: 9, sales: 148, joined: "kwiecień 2026",
    c1: "#a06a9e", c2: "#c9748f",
  },
  nocna: {
    handle: "NocnaZmiana",
    bio: "Pracuję nocami, fotografuję o świcie. Naturalne światło, zero filtrów. Rozmiar 37.",
    listings: 21, sales: 305, joined: "luty 2026",
    c1: "#7d5a9e", c2: "#b97a92",
  },
  wisienka: {
    handle: "Wisienka",
    bio: "Studentka ASP — do każdego zamówienia dorzucam odręczny liścik. Sesje custom po wcześniejszej rozmowie.",
    listings: 7, sales: 89, joined: "maj 2026",
    c1: "#c95f6e", c2: "#e0a17a",
  },
  balerinka: {
    handle: "Balerinka",
    bio: "Osiem lat baletu zostawia ślady — moi stali klienci wiedzą jakie. Video z pointami to moja specjalność.",
    listings: 12, sales: 260, joined: "marzec 2026",
    c1: "#b97a92", c2: "#e6c294",
  },
  pani_w: {
    handle: "PaniW",
    bio: "Elegancja przede wszystkim. Tylko jedwab i satyna, tylko limitowane ilości. Nie odpisuję na wiadomości bez kultury.",
    listings: 6, sales: 174, joined: "styczeń 2026",
    c1: "#8f5a78", c2: "#d8b07e",
  },
};

// opisy ofert — widok szczegółów
const LISTING_DESCS = {
  1:  "Sesja z porannego światła przy kuchennym oknie. 12 zdjęć w pełnej rozdzielczości, bez filtrów — tylko kawa, promienie i świeżo zadbane stopy. Dostawa cyfrowa od razu po zakupie.",
  2:  "Czarny koronkowy komplet z mojej prywatnej kolekcji, noszony przez pełne 48 godzin. Pakowany próżniowo w jedwabny papier, wysyłka w neutralnym kartonie bez logo.",
  3:  "Osiem zdjęć zrobionych o świcie po dwunastogodzinnej zmianie + dwa bonusowe dla cierpliwych. Naturalne światło, zero retuszu, rozmiar 37.",
  4:  "Zakolanówki z miękkiej bawełny po całym dniu wykładów i spacerów po mieście. Do paczki dorzucam odręczny liścik i małą niespodziankę.",
  5:  "Sześć minut rozgrzewki na pointach nagrane w studiu baletowym. Osiem lat treningu w jednym ujęciu — od rozciągania po pierwsze piruety. Full HD, pion.",
  6:  "Limitowany komplet z czarnej satyny — do sprzedania tylko dwie sztuki. W zestawie sesja 10 zdjęć w tym komplecie. Elegancja albo nic.",
  7:  "Piętnaście zdjęć świeżego pedicure w wiśniowym lakierze — zbliżenia, pełne kadry, światło dzienne. Mój bestseller w nowej odsłonie.",
  8:  "Stringi z limitowanej serii, których nie kupisz już w sklepie. Noszone dobę, pakowane dyskretnie, z odręcznym liścikiem na perfumowanym papierze.",
  9:  "Skarpetki frotte prosto po 10 kilometrach porannego biegu. Wysyłka tego samego dnia w szczelnym opakowaniu — świeżość gwarantowana.",
  10: "Cztery minuty wideo: stopy w jedwabnej pościeli, poranne przeciąganie się, gra świateł. Nagrane telefonem, ale w 4K — intymnie i naturalnie.",
  11: "Zestaw tygodniowy: pięć par noszonych skarpetek + galeria 20 zdjęć dokumentujących każdy dzień. Dla kolekcjonerów — komplet z certyfikatem autentyczności.",
  12: "Baletki po całej próbie spektaklu + sesja ośmiu zdjęć w studiu. Ślady ośmiu lat baletu w jednej parze — dla koneserów.",
};

// opinie kupujących (fikcyjne)
const REVIEWS = {
  1: [
    { buyer: "Misiek_88",  stars: 5, when: "3 dni temu",   text: "Piękne światło, świetna jakość zdjęć. Malina odpisuje szybko i z klasą." },
    { buyer: "Wilk_z_Woli", stars: 5, when: "tydzień temu", text: "Druga sesja którą kupuję i na pewno nie ostatnia. Polecam." },
  ],
  2: [
    { buyer: "Dyskretny_K", stars: 5, when: "2 dni temu",  text: "Pakowanie na najwyższym poziomie, przesyłka w 24h. Pełen profesjonalizm." },
    { buyer: "NocnyMarek",  stars: 4, when: "5 dni temu",  text: "Jakość super, czekałem tylko trochę dłużej niż zapowiadane 2 dni." },
  ],
  5: [
    { buyer: "Balet_Fan",   stars: 5, when: "wczoraj",     text: "Widać lata treningu. Najlepsze wideo w tej kategorii, kupuję wszystko od Balerinki." },
  ],
  6: [
    { buyer: "Esteta_44",   stars: 5, when: "4 dni temu",  text: "Satyna, klasa, dyskrecja. PaniW nie schodzi poniżej pewnego poziomu." },
  ],
  7: [
    { buyer: "Misiek_88",   stars: 5, when: "tydzień temu", text: "Wiśniowy lakier to strzał w dziesiątkę. Zbliżenia ostre jak brzytwa." },
  ],
  10: [
    { buyer: "Świt_i_Ja",   stars: 4, when: "3 dni temu",  text: "Klimat wideo świetny, jedwab robi robotę. Chętnie zobaczę dłuższą wersję." },
  ],
};

// gotowe odpowiedzi sprzedawczyń w mocku czatu (rotacyjnie)
const CHAT_REPLIES = [
  "Hej! Miło, że piszesz 😊 Śmiało — w czym mogę pomóc?",
  "Jasne, wszystko co widzisz w moim katalogu jest aktualne. Coś konkretnego Cię kusi?",
  "Mogę przygotować coś na zamówienie — opisz, o czym myślisz, a wycenię. Budżet ustalamy z góry.",
  "Wysyłka zawsze dyskretna, neutralny karton, nadanie w 24–48h od zakupu.",
  "Dziękuję! Wpadnij też na moje zajawki — tam zawsze najpierw pokazuję nowości ✨",
];

// zajawki — krótkie wideo promocyjne sprzedawczyń (w prototypie: animowany atłas)
const SHORTS = [
  { id: 1, seller: "malina",    listing: 1,  dur: 8,  seed: 31, views: 12400, likes: 980,
    caption: "Poranna kawa, bose stopy i pierwsze światło — zajawka nowej sesji ☕" },
  { id: 2, seller: "balerinka", listing: 5,  dur: 10, seed: 32, views: 20100, likes: 1740,
    caption: "Rozgrzewka na pointach — 10 sekund z 6-minutowego video 🩰" },
  { id: 3, seller: "aksamitka", listing: 2,  dur: 7,  seed: 33, views: 8300,  likes: 640,
    caption: "Tak pakuję każdą paczkę: jedwabny papier, wstążka, zero logo na kopercie" },
  { id: 4, seller: "nocna",     listing: 10, dur: 9,  seed: 34, views: 15700, likes: 1210,
    caption: "Po nocnej zmianie, przed świtem. Naturalne światło, zero filtrów 🌙" },
  { id: 5, seller: "wisienka",  listing: 7,  dur: 8,  seed: 35, views: 6900,  likes: 530,
    caption: "Świeży wiśniowy lakier — kulisy dzisiejszej sesji + odręczny liścik 🍒" },
  { id: 6, seller: "pani_w",    listing: 6,  dur: 11, seed: 36, views: 9800,  likes: 870,
    caption: "Satyna czy jedwab? Limitowany komplet, zostały 2 sztuki." },
  { id: 7, seller: "balerinka", listing: 11, dur: 9,  seed: 37, views: 11200, likes: 905,
    caption: "Tydzień z życia baleriny — zestaw 5 par + galeria. Zajawka za kulisami" },
  { id: 8, seller: "malina",    listing: 9,  dur: 7,  seed: 38, views: 5400,  likes: 410,
    caption: "10 km za mną. Skarpetki frotte prosto z treningu — kto pierwszy? 🏃‍♀️" },
];

const LISTINGS = [
  { id: 1,  title: "Poranna kawa i bose stopy — sesja 12 zdjęć", cat: "stopki",    price: 45,  seller: "malina",    seed: 1 },
  { id: 2,  title: "Koronkowy komplet, noszony 48h",             cat: "bielizna",  price: 180, seller: "aksamitka", seed: 2 },
  { id: 3,  title: "Po nocnej zmianie — 8 zdjęć + 2 bonusowe",   cat: "stopki",    price: 35,  seller: "nocna",     seed: 3 },
  { id: 4,  title: "Zakolanówki po całym dniu na uczelni",       cat: "skarpetki", price: 90,  seller: "wisienka",  seed: 4 },
  { id: 5,  title: "Video: rozgrzewka na pointach, 6 min",       cat: "video",     price: 120, seller: "balerinka", seed: 5 },
  { id: 6,  title: "Satynowa czerń — komplet z sesją 10 zdjęć",  cat: "zestawy",   price: 250, seller: "pani_w",    seed: 6 },
  { id: 7,  title: "Świeży pedicure, wiśniowy lakier — 15 zdjęć",cat: "stopki",    price: 50,  seller: "wisienka",  seed: 7 },
  { id: 8,  title: "Stringi z limitowanej kolekcji + liścik",    cat: "bielizna",  price: 140, seller: "aksamitka", seed: 8 },
  { id: 9,  title: "Skarpetki frotte po treningu biegowym",      cat: "skarpetki", price: 75,  seller: "malina",    seed: 9 },
  { id: 10, title: "Video: stopy w jedwabnej pościeli, 4 min",   cat: "video",     price: 95,  seller: "nocna",     seed: 10 },
  { id: 11, title: "Zestaw tygodniowy: 5 par + galeria 20 zdjęć",cat: "zestawy",   price: 320, seller: "balerinka", seed: 11 },
  { id: 12, title: "Baletki po próbie + sesja 8 zdjęć",          cat: "stopki",    price: 65,  seller: "balerinka", seed: 12 },
];
