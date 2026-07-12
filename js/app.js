// szeptem. — logika prototypu: nawigacja, katalog, profil, modal zakupu

(function () {
  "use strict";

  // ── konfiguracja zapisów ──
  // Po założeniu darmowego konta na formspree.io wklej tu adres formularza,
  // np. "https://formspree.io/f/abcdwxyz". Puste = zapisy lądują w localStorage
  // przeglądarki zgłaszającego (tryb demo, bez wysyłki).
  const FORM_ENDPOINT = "";

  // tryb czystego nagrywania (rolki): ?demo w adresie pomija bramkę 18+
  // i chowa dopiski o prototypie
  const DEMO_MODE = new URLSearchParams(location.search).has("demo");
  if (DEMO_MODE) {
    document.body.classList.add("demo");
    sessionStorage.setItem("szeptem-adult", "1");
  }

  // ── bramka 18+ ──
  const agegate = document.getElementById("agegate");
  if (sessionStorage.getItem("szeptem-adult") === "1") {
    agegate.classList.add("hidden");
  }
  document.getElementById("age-yes").addEventListener("click", () => {
    sessionStorage.setItem("szeptem-adult", "1");
    agegate.classList.add("hidden");
  });

  // ── baner startowy ──
  const banner = document.getElementById("launch-banner");
  if (!localStorage.getItem("szeptem-banner-off") && !DEMO_MODE) banner.hidden = false;
  document.getElementById("launch-banner-close").addEventListener("click", () => {
    banner.hidden = true;
    localStorage.setItem("szeptem-banner-off", "1");
  });

  // ── zapisy: lista pionierek + lista oczekujących ──
  function wireSignupForm(formId, kind, successMsg) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener("submit", e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      data._typ = kind;
      const done = () => {
        form.innerHTML = `<p class="signup-done">${successMsg}</p>`;
      };
      if (FORM_ENDPOINT) {
        fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data),
        }).then(done).catch(() => toast("Nie udało się wysłać — spróbuj ponownie"));
      } else {
        // tryb demo: bez skonfigurowanego FORM_ENDPOINT zgłoszenie zostaje lokalnie
        const box = JSON.parse(localStorage.getItem("szeptem-zgloszenia") || "[]");
        box.push(data);
        localStorage.setItem("szeptem-zgloszenia", JSON.stringify(box));
        done();
      }
    });
  }
  wireSignupForm("founding-form", "pionierka",
    "Dziękujemy! Jesteś na liście pionierek — odezwiemy się przed startem z detalami. ✨");
  wireSignupForm("waitlist-form", "kupujacy",
    "Zapisano! Dostaniesz jedną wiadomość w dniu startu.");

  // ── nawigacja między widokami ──
  const views = document.querySelectorAll(".view");
  const navLinks = document.querySelectorAll(".nav-link");

  function show(view) {
    views.forEach(v => v.classList.toggle("active", v.id === "view-" + view));
    navLinks.forEach(l => l.classList.toggle("active", l.dataset.nav === view));
    document.querySelectorAll(".mobile-nav a").forEach(l =>
      l.classList.toggle("active", l.dataset.nav === view));
    window.scrollTo({ top: 0, behavior: "instant" });
    // feed zajawek dostaje wymiary dopiero po pokazaniu widoku
    if (view === "shorts") setTimeout(updatePlayingShort);
    if (view === "messages") renderChats();
  }

  document.addEventListener("click", e => {
    const nav = e.target.closest("[data-nav]");
    if (nav) { e.preventDefault(); show(nav.dataset.nav); }
  });

  // ── mobilna nawigacja (dolny pasek) ──
  const mobileNav = document.createElement("nav");
  mobileNav.className = "mobile-nav";
  mobileNav.innerHTML = `
    <a href="#" data-nav="home" class="active">Start</a>
    <a href="#" data-nav="shorts">Zajawki</a>
    <a href="#" data-nav="browse">Katalog</a>
    <a href="#" data-nav="messages">Czat</a>
    <a href="#" data-nav="sellers">Sprzedaż</a>
    <a href="#" data-nav="safety">Zasady</a>`;
  document.body.appendChild(mobileNav);

  // ── generowanie „atłasowych" placeholderów (deterministyczne per seed) ──
  function rng(seed) {
    let s = seed * 2654435761 % 2147483647;
    return () => (s = s * 16807 % 2147483647) / 2147483647;
  }
  const PALETTE = ["#c9748f", "#b97a92", "#d8b07e", "#a06a9e", "#8f5a78", "#c95f6e", "#7d5a9e", "#e0a17a"];

  function veilVars(seed) {
    const r = rng(seed + 3);
    const pick = () => PALETTE[Math.floor(r() * PALETTE.length)];
    const pct = (min, max) => Math.round(min + r() * (max - min)) + "%";
    return `--c1:${pick()};--c2:${pick()};--c3:${pick()};` +
      `--x1:${pct(10, 55)};--y1:${pct(10, 45)};` +
      `--x2:${pct(50, 90)};--y2:${pct(40, 85)};` +
      `--x3:${pct(20, 75)};--y3:${pct(70, 100)}`;
  }

  const catLabel = id => (CATEGORIES.find(c => c.id === id) || {}).label || id;

  // polska odmiana: 1 oferta, 2-4 oferty, 5+ ofert (z wyjątkiem 12-14)
  function plural(n, one, few, many) {
    if (n === 1) return one;
    if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) return few;
    return many;
  }

  // ── karta oferty ──
  function listingCard(l) {
    const s = SELLERS[l.seller];
    return `
      <article class="listing">
        <div class="veil-card" style="${veilVars(l.seed)}" tabindex="0" role="button"
             aria-label="Zobacz ofertę: ${l.title}" data-listing="${l.id}">
          <span class="listing-tag">${catLabel(l.cat)}</span>
          <div class="veil-art"></div>
          <div class="veil-cover">
            <svg class="icon-lock" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 8V7a3 3 0 1 1 6 0v3H9Z"/></svg>
            <span>Za zasłoną</span>
            <small>zobacz szczegóły</small>
          </div>
          <span class="listing-price">${l.price} zł</span>
        </div>
        <div class="listing-meta">
          <span class="listing-title">${l.title}</span>
          <a class="listing-seller" href="#" data-profile="${l.seller}">
            <span class="badge-verified" title="Zweryfikowana">✓</span>${s.handle}
          </a>
        </div>
      </article>`;
  }

  function renderGrid(el, items) {
    el.innerHTML = items.map(listingCard).join("");
  }

  // start: 4 najnowsze
  renderGrid(document.getElementById("home-grid"), LISTINGS.slice(0, 4));

  // ── katalog + filtry ──
  const browseGrid = document.getElementById("browse-grid");
  const filtersEl = document.getElementById("filters");
  let activeCat = "all";

  filtersEl.innerHTML = CATEGORIES.map(c =>
    `<button class="filter-chip${c.id === "all" ? " active" : ""}" data-cat="${c.id}">${c.label}</button>`
  ).join("");

  const searchEl = document.getElementById("browse-search");
  const sortEl = document.getElementById("browse-sort");
  const browseEmptyEl = document.getElementById("browse-empty");

  function renderBrowse() {
    let items = activeCat === "all" ? [...LISTINGS] : LISTINGS.filter(l => l.cat === activeCat);
    const q = searchEl.value.trim().toLowerCase();
    if (q) items = items.filter(l =>
      l.title.toLowerCase().includes(q) || SELLERS[l.seller].handle.toLowerCase().includes(q));
    switch (sortEl.value) {
      case "new":        items.reverse(); break;
      case "price-asc":  items.sort((a, b) => a.price - b.price); break;
      case "price-desc": items.sort((a, b) => b.price - a.price); break;
      case "popular":    items.sort((a, b) => SELLERS[b.seller].sales - SELLERS[a.seller].sales); break;
    }
    renderGrid(browseGrid, items);
    browseEmptyEl.hidden = items.length > 0;
  }
  renderBrowse();
  searchEl.addEventListener("input", renderBrowse);
  sortEl.addEventListener("change", renderBrowse);

  // ── strona oferty ──
  const listingRoot = document.getElementById("listing-root");

  const stars = n =>
    `<span class="stars" aria-label="${n} na 5 gwiazdek">${"★".repeat(n)}${"☆".repeat(5 - n)}</span>`;

  function renderListing(id) {
    const l = LISTINGS.find(x => x.id === Number(id));
    const s = SELLERS[l.seller];
    const revs = REVIEWS[l.id] || [];
    const others = LISTINGS.filter(x => x.seller === l.seller && x.id !== l.id).slice(0, 4);
    const seeds = [l.seed, l.seed + 41, l.seed + 83, l.seed + 127];
    listingRoot.innerHTML = `
      <a class="back-link" href="#" data-nav="browse">← Wróć do katalogu</a>
      <div class="listing-page">
        <div class="listing-gallery">
          <div class="veil-card listing-main" id="listing-main" style="${veilVars(seeds[0])}">
            <span class="listing-tag">${catLabel(l.cat)}</span>
            <div class="veil-art"></div>
            <div class="veil-cover">
              <svg class="icon-lock" viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 8V7a3 3 0 1 1 6 0v3H9Z"/></svg>
              <span>Za zasłoną</span>
              <small>pełna galeria po zakupie</small>
            </div>
          </div>
          <div class="listing-thumbs">
            ${seeds.map((sd, i) => `
              <button class="listing-thumb${i === 0 ? " active" : ""}" data-thumb="${sd}"
                      style="${veilVars(sd)}" aria-label="Podgląd ${i + 1} z ${seeds.length}">
                <span class="veil-art"></span>
              </button>`).join("")}
          </div>
        </div>
        <div class="listing-info">
          <p class="eyebrow">${catLabel(l.cat)}</p>
          <h2 class="h2 listing-h">${l.title}</h2>
          <div class="listing-page-price">${l.price} zł</div>
          <p class="listing-desc">${LISTING_DESCS[l.id] || ""}</p>
          <div class="listing-cta">
            <button class="btn btn-gold" data-buy="${l.id}">Kup teraz · ${l.price} zł</button>
          </div>
          <div class="seller-mini">
            <span class="avatar avatar-xs" style="--c1:${s.c1};--c2:${s.c2}">${s.handle[0]}</span>
            <div class="seller-mini-meta">
              <a href="#" data-profile="${l.seller}">${s.handle} <span class="badge-verified" title="Zweryfikowana">✓</span></a>
              <span>${s.sales} sprzedaży · na szeptem od ${s.joined}</span>
            </div>
            <button class="btn btn-ghost btn-sm" data-chat="${l.seller}">Napisz</button>
          </div>
        </div>
      </div>
      <section class="listing-reviews">
        <h3>Opinie (${revs.length})</h3>
        ${revs.length
          ? revs.map(r => `
            <div class="review">
              <div class="review-head">${stars(r.stars)} <b>${r.buyer}</b> <span>${r.when}</span></div>
              <p>${r.text}</p>
            </div>`).join("")
          : `<p class="panel-empty">Ta oferta nie ma jeszcze opinii — bądź pierwszy.</p>`}
      </section>
      ${others.length ? `
        <section class="listing-more">
          <h3>Więcej od ${s.handle}</h3>
          <div class="grid">${others.map(listingCard).join("")}</div>
        </section>` : ""}`;
    show("listing");
  }

  document.addEventListener("click", e => {
    const open = e.target.closest("[data-listing]");
    if (open) { e.preventDefault(); renderListing(open.dataset.listing); return; }
    const thumb = e.target.closest("[data-thumb]");
    if (thumb) {
      document.getElementById("listing-main").setAttribute("style", veilVars(Number(thumb.dataset.thumb)));
      document.querySelectorAll(".listing-thumb").forEach(t =>
        t.classList.toggle("active", t === thumb));
    }
  });

  filtersEl.addEventListener("click", e => {
    const chip = e.target.closest(".filter-chip");
    if (!chip) return;
    activeCat = chip.dataset.cat;
    filtersEl.querySelectorAll(".filter-chip").forEach(c =>
      c.classList.toggle("active", c === chip));
    renderBrowse();
  });

  // ── zajawki (shorts) ──
  const feedEl = document.getElementById("shorts-feed");
  const likedShorts = new Set(); // id-ki jako stringi (własne zajawki mają id "u<timestamp>")

  // zajawki dodane w panelu sprzedawczyni — przeżywają odświeżenie strony
  const MY_SHORTS_KEY = "szeptem-my-shorts";
  let myShorts = [];
  try { myShorts = JSON.parse(localStorage.getItem(MY_SHORTS_KEY)) || []; } catch (e) { /* uszkodzony zapis */ }
  // zajawki zostawione „w moderacji" przed odświeżeniem zatwierdzamy po cichu
  myShorts.forEach(sh => { if (sh.status !== "live") approveShortData(sh); });

  function saveMyShorts() { localStorage.setItem(MY_SHORTS_KEY, JSON.stringify(myShorts)); }

  function approveShortData(sh) {
    sh.status = "live";
    sh.views = 40 + Math.floor(Math.random() * 180);
    sh.likes = 2 + Math.floor(Math.random() * 20);
  }

  const allShorts = () => [...myShorts.filter(sh => sh.status === "live"), ...SHORTS];

  // 12 400 → „12,4 tys.", 980 → „980"
  function fmtCount(n) {
    if (n < 1000) return String(n);
    const t = n / 1000;
    return (t >= 10 || t % 1 === 0 ? Math.round(t) : t.toFixed(1).replace(".", ",")) + " tys.";
  }

  function shortCard(sh) {
    const s = SELLERS[sh.seller];
    const l = LISTINGS.find(x => x.id === sh.listing);
    return `
      <article class="short" data-short="${sh.id}" style="${veilVars(sh.seed)};--dur:${sh.dur}s">
        <div class="short-video">
          <div class="veil-art"></div>
          <div class="short-wm" aria-hidden="true">${"szeptem.&ensp;".repeat(24)}</div>
        </div>
        <div class="short-progress"><i></i></div>
        <span class="listing-tag short-tag">Zajawka · ${sh.dur}s</span>
        <div class="short-tap" data-profile="${sh.seller}" role="button" tabindex="0"
             aria-label="Zobacz profil: ${s.handle}"></div>
        <div class="short-rail">
          <button class="rail-btn${likedShorts.has(String(sh.id)) ? " liked" : ""}" data-like="${sh.id}" aria-label="Polub zajawkę">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 21s-7.5-4.7-10-9.3C.5 8.3 2.6 4.5 6.3 4.5c2 0 3.6 1 4.6 2.6a.13.13 0 0 0 .2 0c1-1.6 2.6-2.6 4.6-2.6 3.7 0 5.8 3.8 4.3 7.2C19.5 16.3 12 21 12 21Z"/></svg>
            <b data-like-count>${fmtCount(sh.likes + (likedShorts.has(String(sh.id)) ? 1 : 0))}</b>
          </button>
          <button class="rail-btn" data-share aria-label="Udostępnij zajawkę">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M14 3v4C6 8 3 13 3 19c2.5-3.4 5.5-5 11-5v4l7-7.5L14 3Z"/></svg>
            <b>Wyślij</b>
          </button>
          <span class="rail-btn rail-views" title="Wyświetlenia">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7L8 5Z"/></svg>
            <b>${fmtCount(sh.views)}</b>
          </span>
        </div>
        <div class="short-overlay">
          <a class="short-seller" href="#" data-profile="${sh.seller}">
            <span class="avatar avatar-xs" style="--c1:${s.c1};--c2:${s.c2}">${s.handle[0]}</span>
            ${s.handle} <span class="badge-verified" title="Zweryfikowana">✓</span>
          </a>
          <p class="short-caption">${sh.caption}</p>
          <div class="short-actions">
            <button class="btn btn-gold btn-sm" data-listing="${l.id}">Oferta z zajawki · ${l.price} zł</button>
            <a class="btn btn-ghost btn-sm" href="#" data-profile="${sh.seller}">Profil</a>
          </div>
        </div>
      </article>`;
  }

  function renderFeed() {
    feedEl.innerHTML = allShorts().map(shortCard).join("");
    updatePlayingShort();
  }
  renderFeed();

  // zwiastun na stronie głównej — miniatury pionowe
  document.getElementById("home-shorts").innerHTML = SHORTS.map(sh => {
    const s = SELLERS[sh.seller];
    return `
      <button class="short-thumb" style="${veilVars(sh.seed)}" data-open-short="${sh.id}"
              aria-label="Obejrzyj zajawkę od ${s.handle}">
        <div class="veil-art"></div>
        <span class="short-thumb-play"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7L8 5Z"/></svg></span>
        <span class="short-thumb-handle"><span class="badge-verified">✓</span>${s.handle}</span>
      </button>`;
  }).join("");

  // aktywna zajawka „gra" — wyznaczana pozycją przewinięcia (scroll-snap trzyma krok)
  function updatePlayingShort() {
    const shorts = feedEl.children;
    if (!shorts.length || !feedEl.clientHeight) return;
    const step = shorts[0].offsetHeight + (parseFloat(getComputedStyle(feedEl).rowGap) || 0);
    const idx = Math.min(shorts.length - 1, Math.max(0, Math.round(feedEl.scrollTop / step)));
    [...shorts].forEach((el, i) => el.classList.toggle("playing", i === idx));
  }
  feedEl.addEventListener("scroll", updatePlayingShort, { passive: true });
  window.addEventListener("resize", updatePlayingShort);
  updatePlayingShort();

  // koniec paska postępu → automatycznie następna (pętla do pierwszej)
  feedEl.addEventListener("animationend", e => {
    if (e.animationName !== "shortProgress") return;
    const current = e.target.closest(".short");
    const next = current.nextElementSibling || feedEl.firstElementChild;
    next.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  // polubienia + udostępnianie
  document.addEventListener("click", e => {
    const like = e.target.closest("[data-like]");
    if (like) {
      const id = like.dataset.like;
      const sh = allShorts().find(x => String(x.id) === id);
      likedShorts.has(id) ? likedShorts.delete(id) : likedShorts.add(id);
      like.classList.toggle("liked", likedShorts.has(id));
      like.querySelector("[data-like-count]").textContent =
        fmtCount(sh.likes + (likedShorts.has(id) ? 1 : 0));
      return;
    }
    if (e.target.closest("[data-share]")) toast("Link do zajawki skopiowany (prototyp)");
    const thumb = e.target.closest("[data-open-short]");
    if (thumb) {
      show("shorts");
      const target = feedEl.querySelector(`.short[data-short="${thumb.dataset.openShort}"]`);
      if (target) target.scrollIntoView({ behavior: "instant", block: "nearest" });
    }
  });

  // strzałki ↑/↓ przewijają feed, gdy widok zajawek jest aktywny
  document.addEventListener("keydown", e => {
    if (!document.getElementById("view-shorts").classList.contains("active")) return;
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const playing = feedEl.querySelector(".short.playing") || feedEl.firstElementChild;
    const target = e.key === "ArrowDown" ? playing.nextElementSibling : playing.previousElementSibling;
    if (target) target.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  // ── toast ──
  let toastTimer;
  function toast(msg) {
    let el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2400);
  }

  // ── obserwowanie sprzedawczyń + powiadomienia ──
  const FOLLOWS_KEY = "szeptem-follows";
  const NOTIFS_KEY = "szeptem-notifs";
  let follows = [];
  let notifs = [];
  try { follows = JSON.parse(localStorage.getItem(FOLLOWS_KEY)) || []; } catch (e) { /* uszkodzony zapis */ }
  try { notifs = JSON.parse(localStorage.getItem(NOTIFS_KEY)) || []; } catch (e) { /* uszkodzony zapis */ }

  function saveNotifs() { localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifs.slice(0, 20))); }

  function addNotif(text, view) {
    notifs.unshift({ text, view, read: false });
    notifs = notifs.slice(0, 20);
    saveNotifs();
    renderBell();
  }

  function renderBell() {
    const badge = document.getElementById("bell-badge");
    if (!badge) return;
    const unread = notifs.filter(n => !n.read).length;
    badge.textContent = unread;
    badge.hidden = unread === 0;
  }

  document.addEventListener("click", e => {
    const follow = e.target.closest("[data-follow]");
    if (follow) {
      const id = follow.dataset.follow;
      const s = SELLERS[id];
      if (follows.includes(id)) {
        follows = follows.filter(x => x !== id);
        toast(`Już nie obserwujesz ${s.handle}`);
      } else {
        follows.push(id);
        toast(`Obserwujesz ${s.handle} — damy znać o nowościach`);
        // mock: chwilę po zaobserwowaniu przychodzi znak życia
        setTimeout(() => addNotif(`${s.handle} dodała nową zajawkę ✨`, "shorts"), 9000);
      }
      localStorage.setItem(FOLLOWS_KEY, JSON.stringify(follows));
      follow.textContent = follows.includes(id) ? "Obserwujesz ✓" : "Obserwuj";
      follow.classList.toggle("following", follows.includes(id));
      return;
    }

    const menu = document.getElementById("bell-menu");
    if (e.target.closest("#btn-bell") && menu) {
      menu.hidden = !menu.hidden;
      if (!menu.hidden) {
        menu.innerHTML = notifs.length
          ? notifs.map((n, i) =>
              `<button class="bell-item${n.read ? "" : " unread"}" data-notif="${i}">${n.text}</button>`).join("")
          : `<p class="bell-none">Cisza. Zaobserwuj sprzedawczynię, żeby dostawać znaki życia.</p>`;
        notifs.forEach(n => n.read = true);
        saveNotifs();
        renderBell();
      }
      return;
    }
    const notifBtn = e.target.closest("[data-notif]");
    if (notifBtn && menu) {
      menu.hidden = true;
      const n = notifs[Number(notifBtn.dataset.notif)];
      if (n.view === "messages") renderChats();
      show(n.view);
      return;
    }
    if (menu && !menu.hidden && !e.target.closest(".bell-wrap")) menu.hidden = true;
  });

  // ── wiadomości 1:1 (mock) ──
  const chatListEl = document.getElementById("chat-list");
  const chatPaneEl = document.getElementById("chat-pane");
  const chatShellEl = document.getElementById("chat-shell");
  const CHATS_KEY = "szeptem-chats";
  let chats = {};
  try { chats = JSON.parse(localStorage.getItem(CHATS_KEY)) || {}; } catch (e) { /* uszkodzony zapis */ }
  let activeChat = null;

  const saveChats = () => localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
  const isLogged = () => !!(sessionStorage.getItem(LOGIN_KEY) || sessionStorage.getItem(SELLER_KEY));

  function renderChats() {
    // mobile: pokazuj panel rozmowy, gdy jest aktywna albo trzeba się zalogować
    chatShellEl.classList.toggle("show-pane", !isLogged() || !!activeChat);
    if (!isLogged()) {
      chatListEl.innerHTML = "";
      chatPaneEl.innerHTML = `
        <div class="chat-empty">
          <p>Zaloguj się, żeby pisać ze sprzedawczyniami.</p>
          <button class="btn btn-gold btn-sm" id="chat-login">Zaloguj</button>
        </div>`;
      document.getElementById("chat-login").addEventListener("click", () => {
        sessionStorage.setItem(LOGIN_KEY, "1");
        renderTopbar();
        renderChats();
        toast("Zalogowano (prototyp)");
      });
      return;
    }

    const ids = Object.keys(chats);
    chatListEl.innerHTML = ids.length
      ? ids.map(id => {
          const s = SELLERS[id];
          const last = chats[id][chats[id].length - 1];
          const preview = last.text.length > 34 ? last.text.slice(0, 34) + "…" : last.text;
          return `
            <button class="chat-item${id === activeChat ? " active" : ""}" data-open-chat="${id}">
              <span class="avatar avatar-xs" style="--c1:${s.c1};--c2:${s.c2}">${s.handle[0]}</span>
              <span class="chat-item-meta"><b>${s.handle}</b><span>${preview}</span></span>
            </button>`;
        }).join("")
      : `<p class="chat-none">Brak rozmów. Napisz do sprzedawczyni z jej profilu albo ze strony oferty.</p>`;

    if (!activeChat) {
      chatPaneEl.innerHTML = `<div class="chat-empty"><p>Wybierz rozmowę z listy obok.</p></div>`;
      return;
    }

    const s = SELLERS[activeChat];
    chatPaneEl.innerHTML = `
      <div class="chat-head">
        <button class="chat-back" id="chat-back" aria-label="Wróć do listy rozmów">←</button>
        <span class="avatar avatar-xs" style="--c1:${s.c1};--c2:${s.c2}">${s.handle[0]}</span>
        <a href="#" data-profile="${activeChat}">${s.handle} <span class="badge-verified" title="Zweryfikowana">✓</span></a>
      </div>
      <div class="chat-msgs" id="chat-msgs">
        ${chats[activeChat].map(m => `<div class="msg ${m.from}">${m.text}</div>`).join("")}
      </div>
      <form class="chat-form" id="chat-form">
        <input class="input" id="chat-input" placeholder="Napisz wiadomość…" autocomplete="off" maxlength="300">
        <button class="btn btn-gold btn-sm" type="submit">Wyślij</button>
      </form>`;
    const msgs = document.getElementById("chat-msgs");
    msgs.scrollTop = msgs.scrollHeight;

    document.getElementById("chat-back").addEventListener("click", () => {
      activeChat = null;
      chatShellEl.classList.remove("show-pane");
      renderChats();
    });
    document.getElementById("chat-form").addEventListener("submit", e => {
      e.preventDefault();
      const text = document.getElementById("chat-input").value.trim();
      if (!text) return;
      const seller = activeChat;
      chats[seller].push({ from: "me", text });
      saveChats();
      renderChats();
      const inp = document.getElementById("chat-input");
      if (inp) inp.focus();
      // mock odpowiedzi — sprzedawczyni odpisuje po chwili
      setTimeout(() => {
        const herCount = chats[seller].filter(m => m.from === "her").length;
        chats[seller].push({ from: "her", text: CHAT_REPLIES[herCount % CHAT_REPLIES.length] });
        saveChats();
        const viewActive = document.getElementById("view-messages").classList.contains("active");
        if (viewActive && activeChat === seller) renderChats();
        else addNotif(`Nowa wiadomość od ${SELLERS[seller].handle}`, "messages");
      }, 1800);
    });
  }

  function openChat(sellerId) {
    if (!isLogged()) { toast("Zaloguj się, żeby napisać wiadomość"); return; }
    if (!chats[sellerId]) {
      chats[sellerId] = [{ from: "her", text: CHAT_REPLIES[0] }];
      saveChats();
    }
    activeChat = sellerId;
    chatShellEl.classList.add("show-pane");
    renderChats();
    show("messages");
  }

  document.addEventListener("click", e => {
    const chat = e.target.closest("[data-chat]");
    if (chat) { e.preventDefault(); openChat(chat.dataset.chat); return; }
    const item = e.target.closest("[data-open-chat]");
    if (item) {
      activeChat = item.dataset.openChat;
      chatShellEl.classList.add("show-pane");
      renderChats();
    }
  });

  // ── mock logowania: kupujący startuje w zajawkach, sprzedawczyni w panelu ──
  const topbarActions = document.getElementById("topbar-actions");
  const LOGIN_KEY = "szeptem-login";
  const SELLER_KEY = "szeptem-seller";
  const DEMO_SELLER = "malina"; // konto demo panelu sprzedawczyni

  const bellHtml = `
    <span class="bell-wrap">
      <button class="bell" id="btn-bell" aria-label="Powiadomienia">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 22a2.3 2.3 0 0 0 2.3-2.3H9.7A2.3 2.3 0 0 0 12 22Zm7-5.3v-1l-1.7-1.8V9.6c0-3-1.6-5.5-4.3-6.2V3a1 1 0 1 0-2 0v.4C8.3 4.1 6.7 6.6 6.7 9.6v4.3L5 15.7v1h14Z"/></svg>
        <b class="bell-badge" id="bell-badge" hidden></b>
      </button>
      <div class="bell-menu" id="bell-menu" hidden></div>
    </span>`;

  function renderTopbar() {
    if (sessionStorage.getItem(SELLER_KEY)) {
      const s = SELLERS[DEMO_SELLER];
      topbarActions.innerHTML = `${bellHtml}
        <span class="user-chip"><span class="avatar avatar-xs" style="--c1:${s.c1};--c2:${s.c2}">${s.handle[0]}</span><i class="user-chip-name">${s.handle}</i></span>
        <button class="btn btn-gold btn-sm" id="btn-panel">Panel</button>
        <button class="btn btn-ghost btn-sm" id="btn-logout">Wyloguj</button>`;
    } else if (sessionStorage.getItem(LOGIN_KEY)) {
      topbarActions.innerHTML = `${bellHtml}
        <span class="user-chip"><span class="avatar avatar-xs" style="--c1:#7d5a9e;--c2:#d8b07e">M</span><i class="user-chip-name">Misiek_88</i></span>
        <button class="btn btn-ghost btn-sm" id="btn-logout">Wyloguj</button>`;
    } else {
      topbarActions.innerHTML = `
        <button class="btn btn-ghost btn-sm" id="btn-login">Zaloguj</button>
        <button class="btn btn-gold btn-sm" data-nav="sellers">Zacznij sprzedawać</button>`;
    }
    renderBell();
  }
  renderTopbar();

  topbarActions.addEventListener("click", e => {
    if (e.target.id === "btn-login") {
      sessionStorage.setItem(LOGIN_KEY, "1");
      renderTopbar();
      show("shorts");
      toast("Zalogowano (prototyp) — oto Twoje zajawki");
    }
    if (e.target.id === "btn-panel") {
      renderPanel();
      show("panel");
    }
    if (e.target.id === "btn-logout") {
      sessionStorage.removeItem(LOGIN_KEY);
      sessionStorage.removeItem(SELLER_KEY);
      renderTopbar();
      show("home");
    }
  });

  document.getElementById("btn-seller-signup").addEventListener("click", () => {
    sessionStorage.setItem(SELLER_KEY, "1");
    renderTopbar();
    renderPanel();
    show("panel");
    toast("Konto demo — jesteś zalogowana jako Malina ✓");
  });

  // ── panel sprzedawczyni ──
  const panelRoot = document.getElementById("panel-root");
  let draftSeed = 1 + Math.floor(Math.random() * 9999);

  function renderPanel() {
    const s = SELLERS[DEMO_SELLER];
    const myListings = LISTINGS.filter(l => l.seller === DEMO_SELLER);
    const shortViews = allShorts()
      .filter(sh => sh.seller === DEMO_SELLER)
      .reduce((sum, sh) => sum + sh.views, 0);
    const avgPrice = Math.round(myListings.reduce((sum, l) => sum + l.price, 0) / myListings.length);
    const earnings = Math.round(s.sales * avgPrice * 0.85);

    // 7-dniowy mock lejka: wyświetlenia zajawek → wejścia na profil → zakupy
    // (deterministyczny — rng z data.js; paleta zwalidowana na tle panelu)
    const days = ["pn", "wt", "śr", "cz", "pt", "so", "nd"];
    const r7 = rng(97);
    const dayViews = days.map(() => Math.round(shortViews / 9 + r7() * (shortViews / 6)));
    const dayVisits = dayViews.map(v => Math.round(v * (0.30 + r7() * 0.14)));
    const totalViews = dayViews.reduce((a, b) => a + b, 0);
    const totalVisits = dayVisits.reduce((a, b) => a + b, 0);
    const purchases = Math.max(3, Math.round(totalVisits * 0.05));
    const maxV = Math.max(...dayViews);

    const gridLines = [0, 0.5, 1].map(f => {
      const y = 150 - Math.round(f * 130);
      return `<line x1="30" x2="550" y1="${y}" y2="${y}" class="chart-grid"/>` +
        `<text x="26" y="${y + 3}" class="chart-y" text-anchor="end">${fmtCount(Math.round(maxV * f))}</text>`;
    }).join("");
    const chartBars = days.map((d, i) => {
      const gx = 34 + i * 74;
      const hV = Math.max(3, Math.round(dayViews[i] / maxV * 130));
      const hP = Math.max(3, Math.round(dayVisits[i] / maxV * 130));
      return `
        <rect x="${gx + 14}" y="${150 - hV}" width="18" height="${hV}" rx="3" fill="#d9689a"><title>${d}: ${dayViews[i]} wyświetleń zajawek</title></rect>
        <rect x="${gx + 34}" y="${150 - hP}" width="18" height="${hP}" rx="3" fill="#c08434"><title>${d}: ${dayVisits[i]} wejść na profil</title></rect>
        <text x="${gx + 33}" y="172" class="chart-x" text-anchor="middle">${d}</text>`;
    }).join("");

    const rows = myShorts.map(sh => `
      <li class="myshort-row">
        <span class="myshort-veil" style="${veilVars(sh.seed)}"><span class="veil-art"></span></span>
        <span class="myshort-meta">
          <span class="myshort-caption">${sh.caption}</span>
          <span class="myshort-stats">${sh.status === "live"
            ? `${fmtCount(sh.views)} wyświetleń · ${fmtCount(sh.likes)} polubień · ${sh.dur} s`
            : `${sh.dur} s · czeka na moderatora`}</span>
        </span>
        <span class="badge-status ${sh.status}">${sh.status === "live" ? "w feedzie" : "moderacja"}</span>
        <button class="myshort-del" data-del-short="${sh.id}">Usuń</button>
      </li>`).join("");

    panelRoot.innerHTML = `
      <p class="eyebrow">Panel sprzedawczyni</p>
      <div class="panel-head">
        <div class="avatar" style="--c1:${s.c1};--c2:${s.c2}">${s.handle[0]}</div>
        <div>
          <h2 class="profile-name">${s.handle} <span class="badge-verified" title="Zweryfikowana">✓</span></h2>
          <p class="panel-sub">Konto demo · <a href="#" data-profile="${DEMO_SELLER}">zobacz swój profil tak, jak widzą go kupujący →</a></p>
        </div>
      </div>

      <div class="panel-stats">
        <div class="stat-tile"><strong>${s.sales}</strong><span>sprzedaży łącznie</span></div>
        <div class="stat-tile"><strong>${earnings.toLocaleString("pl-PL")} zł</strong><span>Twoje 85% z obrotu</span></div>
        <div class="stat-tile"><strong>${fmtCount(shortViews)}</strong><span>wyświetleń zajawek</span></div>
        <div class="stat-tile"><strong>${myListings.length}</strong><span>${plural(myListings.length, "oferta", "oferty", "ofert")} w katalogu</span></div>
      </div>

      <section class="panel-card panel-chart">
        <h3>Skuteczność zajawek — ostatnie 7 dni</h3>
        <div class="chart-legend">
          <span><i style="background:#d9689a"></i>Wyświetlenia zajawek</span>
          <span><i style="background:#c08434"></i>Wejścia na profil</span>
        </div>
        <svg class="chart" viewBox="0 0 560 190" role="img"
             aria-label="Wykres słupkowy: dzienne wyświetlenia zajawek i wejścia na profil w ostatnich 7 dniach">
          ${gridLines}${chartBars}
        </svg>
        <div class="funnel">
          <div class="funnel-step"><b>${fmtCount(totalViews)}</b><span>wyświetleń zajawek</span></div>
          <div class="funnel-arrow">→ ${Math.round(totalVisits / totalViews * 100)}%</div>
          <div class="funnel-step"><b>${fmtCount(totalVisits)}</b><span>wejść na profil</span></div>
          <div class="funnel-arrow">→ ${(purchases / totalVisits * 100).toFixed(1).replace(".", ",")}%</div>
          <div class="funnel-step"><b>${purchases}</b><span>${plural(purchases, "zakup", "zakupy", "zakupów")} z zajawek</span></div>
        </div>
      </section>

      <div class="panel-cols">
        <section class="panel-card">
          <h3>Dodaj zajawkę</h3>
          <p class="panel-hint">W pełnej wersji wgrasz tu pionowe wideo do 15 sekund. W prototypie zajawka dostaje wylosowany „atłas" — podgląd po prawej.</p>
          <form id="short-form">
            <div class="field">
              <label for="sf-caption">Opis zajawki</label>
              <textarea id="sf-caption" class="input" maxlength="120" rows="3" required
                placeholder="Np. kulisy dzisiejszej sesji — świeży pedicure i poranne światło"></textarea>
              <span class="field-note"><span id="sf-count">0</span>/120</span>
            </div>
            <div class="field">
              <label for="sf-listing">Promowana oferta</label>
              <select id="sf-listing" class="input">
                ${myListings.map(l => `<option value="${l.id}">${l.title} · ${l.price} zł</option>`).join("")}
              </select>
            </div>
            <div class="field">
              <label for="sf-dur">Długość: <b id="sf-dur-val">8 s</b></label>
              <input type="range" id="sf-dur" min="5" max="15" value="8">
            </div>
            <button class="btn btn-gold" type="submit">Wyślij do moderacji</button>
            <p class="panel-hint">Każda zajawka przechodzi moderację przed publikacją — w prototypie trwa to kilka sekund.</p>
          </form>
        </section>

        <section class="panel-card panel-preview">
          <h3>Podgląd</h3>
          <div class="draft-preview" id="sf-preview" style="${veilVars(draftSeed)}">
            <div class="veil-art"></div>
            <div class="short-wm" aria-hidden="true">${"szeptem.&ensp;".repeat(24)}</div>
          </div>
          <button class="btn btn-ghost btn-sm" type="button" id="sf-reseed">Wylosuj inny atłas</button>
        </section>
      </div>

      <section class="panel-card">
        <h3>Twoje zajawki (${myShorts.length})</h3>
        ${myShorts.length
          ? `<ul class="myshorts">${rows}</ul>`
          : `<p class="panel-empty">Nie masz jeszcze zajawek. Dodaj pierwszą — kupujący zobaczą ją na samej górze feedu.</p>`}
      </section>`;

    // formularz — licznik znaków, suwak, losowanie atłasu, publikacja
    const cap = document.getElementById("sf-caption");
    cap.addEventListener("input", () => {
      document.getElementById("sf-count").textContent = cap.value.length;
    });
    const dur = document.getElementById("sf-dur");
    dur.addEventListener("input", () => {
      document.getElementById("sf-dur-val").textContent = dur.value + " s";
    });
    document.getElementById("sf-reseed").addEventListener("click", () => {
      draftSeed = 1 + Math.floor(Math.random() * 9999);
      document.getElementById("sf-preview").setAttribute("style", veilVars(draftSeed));
    });
    document.getElementById("short-form").addEventListener("submit", e => {
      e.preventDefault();
      const caption = cap.value.trim();
      if (caption.length < 10) { toast("Opis musi mieć co najmniej 10 znaków"); return; }
      const sh = {
        id: "u" + Date.now(),
        seller: DEMO_SELLER,
        listing: Number(document.getElementById("sf-listing").value),
        dur: Number(dur.value),
        seed: draftSeed,
        caption, views: 0, likes: 0,
        status: "mod",
      };
      myShorts.unshift(sh);
      saveMyShorts();
      draftSeed = 1 + Math.floor(Math.random() * 9999);
      renderPanel();
      toast("Wysłano do moderacji…");
      setTimeout(() => {
        approveShortData(sh);
        saveMyShorts();
        renderFeed();
        if (document.getElementById("view-panel").classList.contains("active")) renderPanel();
        toast("Zajawka przeszła moderację — jest w feedzie ✓");
        addNotif("Twoja zajawka przeszła moderację i jest w feedzie", "shorts");
      }, 4000);
    });
  }

  // usuwanie własnej zajawki
  panelRoot.addEventListener("click", e => {
    const del = e.target.closest("[data-del-short]");
    if (!del) return;
    myShorts = myShorts.filter(sh => String(sh.id) !== del.dataset.delShort);
    saveMyShorts();
    renderFeed();
    renderPanel();
    toast("Zajawka usunięta");
  });

  // zalogowany użytkownik zaczyna od zajawek / panelu
  if (sessionStorage.getItem("szeptem-adult") === "1") {
    if (sessionStorage.getItem(SELLER_KEY)) { renderPanel(); show("panel"); }
    else if (sessionStorage.getItem(LOGIN_KEY)) show("shorts");
  }

  // ── profil sprzedawczyni ──
  const profileRoot = document.getElementById("profile-root");

  function renderProfile(id) {
    const s = SELLERS[id];
    const items = LISTINGS.filter(l => l.seller === id);
    profileRoot.innerHTML = `
      <a class="back-link" href="#" data-nav="browse">← Wróć do katalogu</a>
      <div class="profile-head">
        <div class="avatar" style="--c1:${s.c1};--c2:${s.c2}">${s.handle[0]}</div>
        <div>
          <h2 class="profile-name">${s.handle} <span class="badge-verified" title="Zweryfikowana">✓</span></h2>
          <p class="profile-bio">${s.bio}</p>
          <div class="profile-stats">
            <span><b>${items.length}</b> ${plural(items.length, "oferta", "oferty", "ofert")} w katalogu</span>
            <span><b>${s.sales}</b> sprzedaży</span>
            <span>na szeptem od <b>${s.joined}</b></span>
          </div>
          <div class="profile-actions">
            <button class="btn btn-gold btn-sm" data-chat="${id}">Napisz wiadomość</button>
            <button class="btn btn-ghost btn-sm follow-btn${follows.includes(id) ? " following" : ""}" data-follow="${id}">
              ${follows.includes(id) ? "Obserwujesz ✓" : "Obserwuj"}</button>
          </div>
        </div>
      </div>
      <div class="grid">${items.map(listingCard).join("")}</div>`;
    show("profile");
  }

  document.addEventListener("click", e => {
    const prof = e.target.closest("[data-profile]");
    if (prof) { e.preventDefault(); renderProfile(prof.dataset.profile); }
  });

  // ── modal zakupu (mock) ──
  const modal = document.getElementById("modal");
  const modalBody = document.getElementById("modal-body");

  function openBuy(id) {
    const l = LISTINGS.find(x => x.id === Number(id));
    const s = SELLERS[l.seller];
    modalBody.innerHTML = `
      <h3>${l.title}</h3>
      <p class="modal-seller">od <strong>${s.handle}</strong> · ${catLabel(l.cat)}</p>
      <div class="modal-price">${l.price} zł</div>
      <div class="pay-options">
        <button class="pay-option"><span>Karta płatnicza</span><small>Visa / Mastercard</small></button>
        <button class="pay-option"><span>Portfel szeptem</span><small>doładuj raz, kupuj bez śladu</small></button>
        <button class="pay-option"><span>Kryptowaluty</span><small>BTC / USDC</small></button>
      </div>
      <p class="modal-note">Na wyciągu zobaczysz neutralną nazwę operatora płatności.<br>Prototyp — płatności nie są aktywne.</p>`;
    modal.hidden = false;
    modalBody.querySelectorAll(".pay-option").forEach(b =>
      b.addEventListener("click", () => {
        modalBody.innerHTML = `
          <h3>Dziękujemy!</h3>
          <p class="modal-seller">W pełnej wersji treść odsłoniłaby się tutaj, a sprzedawczyni dostałaby powiadomienie.</p>
          <div class="modal-price">✓</div>
          <p class="modal-note">Prototyp — żadna płatność nie została pobrana.</p>`;
      }));
  }

  document.addEventListener("click", e => {
    const buy = e.target.closest("[data-buy]");
    if (buy) openBuy(buy.dataset.buy);
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Enter" && document.activeElement && document.activeElement.dataset.listing
        && document.activeElement.tagName !== "BUTTON") {
      renderListing(document.activeElement.dataset.listing);
    }
    if (e.key === "Enter" && document.activeElement && document.activeElement.classList.contains("short-tap")) {
      renderProfile(document.activeElement.dataset.profile);
    }
    if (e.key === "Escape" && !modal.hidden) modal.hidden = true;
  });

  document.getElementById("modal-close").addEventListener("click", () => modal.hidden = true);
  modal.addEventListener("click", e => { if (e.target === modal) modal.hidden = true; });
})();
