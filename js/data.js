// szeptem. — przykładowe dane prototypu (całkowicie fikcyjne)

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
