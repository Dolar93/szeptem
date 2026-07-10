// szeptem. — logika prototypu: nawigacja, katalog, profil, modal zakupu

(function () {
  "use strict";

  // ── bramka 18+ ──
  const agegate = document.getElementById("agegate");
  if (sessionStorage.getItem("szeptem-adult") === "1") {
    agegate.classList.add("hidden");
  }
  document.getElementById("age-yes").addEventListener("click", () => {
    sessionStorage.setItem("szeptem-adult", "1");
    agegate.classList.add("hidden");
  });

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
             aria-label="Kup: ${l.title}" data-buy="${l.id}">
          <span class="listing-tag">${catLabel(l.cat)}</span>
          <div class="veil-art"></div>
          <div class="veil-cover">
            <svg class="icon-lock" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 8V7a3 3 0 1 1 6 0v3H9Z"/></svg>
            <span>Za zasłoną</span>
            <small>kliknij, aby kupić</small>
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

  function renderBrowse() {
    const items = activeCat === "all" ? LISTINGS : LISTINGS.filter(l => l.cat === activeCat);
    renderGrid(browseGrid, items);
  }
  renderBrowse();

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
  const likedShorts = new Set();

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
          <button class="rail-btn${likedShorts.has(sh.id) ? " liked" : ""}" data-like="${sh.id}" aria-label="Polub zajawkę">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 21s-7.5-4.7-10-9.3C.5 8.3 2.6 4.5 6.3 4.5c2 0 3.6 1 4.6 2.6a.13.13 0 0 0 .2 0c1-1.6 2.6-2.6 4.6-2.6 3.7 0 5.8 3.8 4.3 7.2C19.5 16.3 12 21 12 21Z"/></svg>
            <b data-like-count>${fmtCount(sh.likes + (likedShorts.has(sh.id) ? 1 : 0))}</b>
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
            <button class="btn btn-gold btn-sm" data-buy="${l.id}">Oferta z zajawki · ${l.price} zł</button>
            <a class="btn btn-ghost btn-sm" href="#" data-profile="${sh.seller}">Profil</a>
          </div>
        </div>
      </article>`;
  }

  feedEl.innerHTML = SHORTS.map(shortCard).join("");

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
      const id = Number(like.dataset.like);
      const sh = SHORTS.find(x => x.id === id);
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

  // ── mock logowania — po zalogowaniu startujesz w zajawkach ──
  const topbarActions = document.getElementById("topbar-actions");
  const LOGIN_KEY = "szeptem-login";

  function renderTopbar() {
    if (sessionStorage.getItem(LOGIN_KEY)) {
      topbarActions.innerHTML = `
        <span class="user-chip"><span class="avatar avatar-xs" style="--c1:#7d5a9e;--c2:#d8b07e">M</span>Misiek_88</span>
        <button class="btn btn-ghost btn-sm" id="btn-logout">Wyloguj</button>`;
    } else {
      topbarActions.innerHTML = `
        <button class="btn btn-ghost btn-sm" id="btn-login">Zaloguj</button>
        <button class="btn btn-gold btn-sm" data-nav="sellers">Zacznij sprzedawać</button>`;
    }
  }
  renderTopbar();

  topbarActions.addEventListener("click", e => {
    if (e.target.id === "btn-login") {
      sessionStorage.setItem(LOGIN_KEY, "1");
      renderTopbar();
      show("shorts");
      toast("Zalogowano (prototyp) — oto Twoje zajawki");
    }
    if (e.target.id === "btn-logout") {
      sessionStorage.removeItem(LOGIN_KEY);
      renderTopbar();
      show("home");
    }
  });

  // zalogowany użytkownik zaczyna od zajawek
  if (sessionStorage.getItem(LOGIN_KEY) && sessionStorage.getItem("szeptem-adult") === "1") {
    show("shorts");
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
    if (e.key === "Enter" && document.activeElement && document.activeElement.dataset.buy) {
      openBuy(document.activeElement.dataset.buy);
    }
    if (e.key === "Enter" && document.activeElement && document.activeElement.classList.contains("short-tap")) {
      renderProfile(document.activeElement.dataset.profile);
    }
    if (e.key === "Escape" && !modal.hidden) modal.hidden = true;
  });

  document.getElementById("modal-close").addEventListener("click", () => modal.hidden = true);
  modal.addEventListener("click", e => { if (e.target === modal) modal.hidden = true; });
})();
