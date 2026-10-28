/* ==========================================================================
   LANTANA CAFÉ BISTRÓ — Interacción
   Carrito, pedido por WhatsApp, formulario, carrusel y animaciones.
   Sin dependencias externas.
   ========================================================================== */
(function () {
  "use strict";

  const D = window.LANTANA;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const STORAGE_KEY = "lantana-cart-v1";
  const FALLBACK_IMG = "assets/brand/patron.webp";

  /* ---------- Utilidades ---------- */
  const waLink = (text) => `https://wa.me/${D.whatsapp}?text=${encodeURIComponent(text)}`;
  const money = (n) => "Bs " + n.toLocaleString("es-BO");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const icon = (id) => `<svg class="icon" aria-hidden="true"><use href="#i-${id}"/></svg>`;

  /** URL optimizada para Unsplash; las rutas locales se devuelven tal cual. */
  function imgSrc(src, w) {
    return src.includes("images.unsplash.com") ? `${src}?auto=format&fit=crop&w=${w}&q=70` : src;
  }
  function imgSrcset(src, widths) {
    if (!src.includes("images.unsplash.com")) return "";
    return widths.map((w) => `${imgSrc(src, w)} ${w}w`).join(", ");
  }

  function openWhatsApp(text) {
    const url = waLink(text);
    const win = window.open(url, "_blank");
    if (win) win.opener = null;
    else window.location.href = url;
    return url;
  }

  function todayISO() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }

  function prettyDate(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-").map(Number);
    const txt = new Date(y, m - 1, d).toLocaleDateString("es-BO", { weekday: "long", day: "numeric", month: "long" });
    return txt.charAt(0).toUpperCase() + txt.slice(1);
  }

  let toastTimer;
  function toast(html) {
    const el = $("#toast");
    el.innerHTML = html;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }

  // Si una foto de referencia no carga, mostramos el patrón de marca.
  document.addEventListener("error", (e) => {
    const t = e.target;
    if (t.tagName === "IMG" && !t.dataset.fellBack && !t.src.endsWith(FALLBACK_IMG)) {
      t.dataset.fellBack = "1";
      t.removeAttribute("srcset");
      t.src = FALLBACK_IMG;
    }
  }, true);

  /* ---------- Enlaces de WhatsApp y redes ---------- */
  function wireLinks(root = document) {
    $$("[data-wa]", root).forEach((a) => {
      const key = a.dataset.wa;
      a.href = waLink(D.messages[key] || D.messages.general);
      a.target = "_blank";
      a.rel = "noopener";
    });
    $$("[data-social]", root).forEach((a) => {
      a.href = D[a.dataset.social];
    });
  }

  /* ---------- Header ---------- */
  function initHeader() {
    const header = $("#header");
    const toggle = $(".nav-toggle");
    const nav = $("#main-nav");

    const hero = $("#inicio");
    const onScroll = () => {
      header.classList.toggle("scrolled", window.scrollY > 10);
      document.body.classList.toggle("past-hero", window.scrollY > hero.offsetHeight * 0.6);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      nav.classList.toggle("open", open);
      document.body.classList.toggle("no-scroll", open);
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    $$("a", nav).forEach((a) => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
    window.matchMedia("(min-width: 960px)").addEventListener("change", () => setOpen(false));

    // Enlace activo según la sección visible
    const links = $$(".main-nav ul a");
    const map = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting && map.has(en.target.id)) {
          links.forEach((l) => l.classList.remove("active"));
          map.get(en.target.id).classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------- Catálogo ---------- */
  function priceLabel(p) {
    const prices = p.options.map((o) => o.price).filter((n) => n != null);
    if (!prices.length) return `<span class="product-price tbc">Precio a confirmar</span>`;
    const min = Math.min(...prices);
    return `<span class="product-price">${prices.length > 1 ? "desde " : ""}${money(min)}</span>`;
  }

  function productCard(p) {
    const opts = p.options.length > 1
      ? `<div class="opt-group" role="radiogroup" aria-label="Presentación de ${esc(p.name)}">
          ${p.options.map((o, i) => `
            <button type="button" class="opt" role="radio" aria-checked="${i === 0}" data-opt="${o.id}">
              <span>${esc(o.label)}</span><small>${o.price != null ? money(o.price) : "A consultar"}</small>
            </button>`).join("")}
        </div>`
      : "";
    const toppings = p.toppings
      ? `<div class="topping-select">
          <label for="tp-${p.id}">Topping (opcional)</label>
          <select id="tp-${p.id}" data-topping>
            <option value="">Sin topping</option>
            ${D.toppings.map((t) => `<option value="${t.id}">${esc(t.name)}</option>`).join("")}
          </select>
        </div>`
      : "";
    const ctaText = p.message || `Hola Lantana Café Bistró. Quisiera consultar disponibilidad del ${p.name}.`;

    return `
      <article class="product reveal" data-id="${p.id}" data-category="${p.category}">
        <div class="product-media">
          <img src="${imgSrc(p.img, 800)}" srcset="${imgSrcset(p.img, [480, 800, 1100])}"
               sizes="(min-width: 960px) 33vw, (min-width: 640px) 50vw, 100vw"
               alt="${esc(p.alt)}" width="800" height="680" loading="lazy" decoding="async">
          ${p.badge ? `<span class="product-badge">${esc(p.badge)}</span>` : ""}
        </div>
        <div class="product-body">
          <div class="product-top">
            <h3>${esc(p.name)}</h3>
            ${priceLabel(p)}
          </div>
          <p class="product-desc">${esc(p.description)}</p>
          ${p.note ? `<p class="product-note">${esc(p.note)}</p>` : ""}
          ${opts}
          ${toppings}
          <div class="product-actions">
            <div class="qty" aria-label="Cantidad">
              <button type="button" data-qty="-1" aria-label="Quitar uno">${icon("minus")}</button>
              <output aria-live="polite">1</output>
              <button type="button" data-qty="1" aria-label="Agregar uno">${icon("plus")}</button>
            </div>
            <button type="button" class="btn btn-primary add-btn" data-add>Agregar al pedido</button>
          </div>
          <a class="product-cta" href="${waLink(ctaText)}" target="_blank" rel="noopener">${icon("whatsapp")} ${esc(p.cta)}</a>
        </div>
      </article>`;
  }

  function initCatalog() {
    const grid = $("#product-grid");
    grid.innerHTML = D.products.map(productCard).join("");

    // Filtros
    const filters = $("#filters");
    filters.innerHTML = D.categories.map((c, i) =>
      `<button type="button" class="chip" role="tab" aria-selected="${i === 0}" data-filter="${c.id}">${esc(c.label)}</button>`
    ).join("");
    filters.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-filter]");
      if (!btn) return;
      $$(".chip", filters).forEach((c) => c.setAttribute("aria-selected", String(c === btn)));
      const f = btn.dataset.filter;
      $$(".product", grid).forEach((card) => {
        const show = f === "todos" || card.dataset.category === f;
        card.classList.toggle("is-hidden", !show);
        if (show) card.classList.add("in");
      });
    });

    // Interacción dentro de las cards
    grid.addEventListener("click", (e) => {
      const card = e.target.closest(".product");
      if (!card) return;

      const opt = e.target.closest(".opt");
      if (opt) {
        $$(".opt", card).forEach((o) => o.setAttribute("aria-checked", String(o === opt)));
        return;
      }
      const q = e.target.closest("[data-qty]");
      if (q) {
        const out = $("output", card);
        out.value = out.textContent = String(Math.min(50, Math.max(1, Number(out.textContent) + Number(q.dataset.qty))));
        return;
      }
      const add = e.target.closest("[data-add]");
      if (add) {
        const p = D.products.find((x) => x.id === card.dataset.id);
        const selected = $(".opt[aria-checked='true']", card);
        const optionId = selected ? selected.dataset.opt : p.options[0].id;
        const topping = $("[data-topping]", card)?.value || "";
        const qty = Number($("output", card).textContent);
        Cart.add(p.id, optionId, topping, qty);

        add.classList.add("added");
        add.innerHTML = `${icon("check")} Agregado`;
        setTimeout(() => { add.classList.remove("added"); add.textContent = "Agregar al pedido"; }, 1600);
        const out = $("output", card);
        out.value = out.textContent = "1";
        toast(`${icon("check")} ${esc(p.name)} agregado a tu pedido`);
      }
    });
  }

  /** Lleva al producto en el menú y lo resalta brevemente. */
  function focusProduct(id) {
    const card = $(`.product[data-id="${id}"]`);
    if (!card) return;
    if (card.classList.contains("is-hidden")) $('[data-filter="todos"]').click();
    card.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    card.classList.remove("flash");
    void card.offsetWidth;
    card.classList.add("flash");
    setTimeout(() => card.classList.remove("flash"), 2200);
  }

  function initPeek() {
    const list = $("#peek-list");
    list.innerHTML = D.products.filter((p) => p.featured).map((p) => `
      <li>
        <a class="peek-card" href="#menu" data-peek="${p.id}">
          <img src="${imgSrc(p.img, 160)}" alt="" width="64" height="64" loading="lazy" decoding="async">
          <span>
            <strong>${esc(p.name)}</strong>
            <small>${priceLabel(p).replace(/<[^>]+>/g, "")}</small>
          </span>
          <span class="peek-arrow">${icon("arrow-right")}</span>
        </a>
      </li>`).join("");
    list.addEventListener("click", (e) => {
      const a = e.target.closest("[data-peek]");
      if (!a) return;
      e.preventDefault();
      focusProduct(a.dataset.peek);
    });
  }

  function initToppings() {
    $("#topping-list").innerHTML = D.toppings.map((t) => `
      <li class="topping reveal">
        <div class="topping-img">
          <img src="${imgSrc(t.img, 320)}" alt="${esc(t.alt)}" width="320" height="320" loading="lazy" decoding="async">
        </div>
        <h3>${esc(t.name)}</h3>
        <p>${esc(t.note)}</p>
      </li>`).join("");
  }

  /* ---------- Carrito ---------- */
  const Cart = {
    items: [],

    load() {
      try { this.items = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch (_) { this.items = []; }
      // Descarta entradas de productos que ya no existen en el catálogo
      this.items = this.items.filter((i) => this.resolve(i));
    },
    save() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items)); } catch (_) { /* modo privado */ }
    },
    resolve(item) {
      const product = D.products.find((p) => p.id === item.productId);
      const option = product && product.options.find((o) => o.id === item.optionId);
      if (!product || !option) return null;
      const topping = D.toppings.find((t) => t.id === item.topping) || null;
      return { product, option, topping };
    },
    add(productId, optionId, topping, qty) {
      const key = [productId, optionId, topping].join("|");
      const found = this.items.find((i) => i.key === key);
      if (found) found.qty = Math.min(99, found.qty + qty);
      else this.items.push({ key, productId, optionId, topping, qty });
      this.save();
      render(true);
    },
    setQty(key, qty) {
      const it = this.items.find((i) => i.key === key);
      if (!it) return;
      if (qty <= 0) this.items = this.items.filter((i) => i.key !== key);
      else it.qty = Math.min(99, qty);
      this.save();
      render();
    },
    clear() { this.items = []; this.save(); render(); },
    count() { return this.items.reduce((n, i) => n + i.qty, 0); },
    totals() {
      let total = 0, pending = false;
      this.items.forEach((i) => {
        const r = this.resolve(i);
        if (r.option.price == null) pending = true;
        else total += r.option.price * i.qty;
        if (r.topping && r.topping.price != null) total += r.topping.price * i.qty;
      });
      return { total, pending };
    },
  };

  function lineLabel(r) {
    const parts = [];
    if (r.product.options.length > 1) parts.push(r.option.label);
    if (r.topping) parts.push(`Topping: ${r.topping.name}`);
    return parts.join(" · ");
  }

  function render(bump) {
    const count = Cart.count();
    const { total, pending } = Cart.totals();

    $$("[data-cart-count]").forEach((el) => {
      el.textContent = count;
      if (el.classList.contains("cart-count")) {
        el.hidden = count === 0;
        if (bump && !reduceMotion) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
      }
    });
    $$("[data-cart-word]").forEach((el) => (el.textContent = count === 1 ? "producto" : "productos"));
    $$("[data-cart-total]").forEach((el) => (el.textContent = total || !pending ? money(total) : "A confirmar"));
    $("#cart-pending").hidden = !pending;

    const headerCta = $("[data-header-cta]");
    if (count) {
      headerCta.textContent = `Mi pedido (${count})`;
      headerCta.setAttribute("data-open-cart", "");
    } else {
      headerCta.textContent = "Ver menú";
      headerCta.removeAttribute("data-open-cart");
    }

    const bar = $(".cart-bar");
    bar.hidden = count === 0;
    document.body.classList.toggle("has-cart-bar", count > 0);

    // Lista
    $("#cart-empty").hidden = count > 0;
    $("#cart-items").innerHTML = Cart.items.map((i) => {
      const r = Cart.resolve(i);
      const price = r.option.price != null
        ? `<span class="cart-item-price">${money(r.option.price * i.qty)}</span>`
        : `<span class="cart-item-price tbc">Precio a confirmar</span>`;
      return `
        <li class="cart-item" data-key="${esc(i.key)}">
          <img src="${imgSrc(r.product.img, 160)}" alt="" width="72" height="72" loading="lazy">
          <div>
            <h3>${esc(r.product.name)}</h3>
            <p class="cart-item-meta">${esc(lineLabel(r)) || "&nbsp;"}</p>
            <div class="qty" aria-label="Cantidad de ${esc(r.product.name)}">
              <button type="button" data-cart-qty="-1" aria-label="Quitar uno">${icon("minus")}</button>
              <output>${i.qty}</output>
              <button type="button" data-cart-qty="1" aria-label="Agregar uno">${icon("plus")}</button>
            </div>
          </div>
          <div class="cart-item-side">
            ${price}
            <button type="button" class="remove-btn" data-remove aria-label="Eliminar ${esc(r.product.name)}">${icon("trash")}</button>
          </div>
        </li>`;
    }).join("");

    $("#cart-next").disabled = count === 0;
    if (count === 0 && Drawer.step === "checkout") Drawer.go("items");
  }

  /* ---------- Drawer del pedido ---------- */
  const Drawer = {
    el: null, backdrop: null, step: "items", lastFocus: null,

    init() {
      this.el = $("#cart");
      this.backdrop = $(".drawer-backdrop");

      document.addEventListener("click", (e) => {
        // Con productos en el carrito, cualquier "Pedir por WhatsApp" envía el detalle del pedido
        if (e.target.closest('[data-wa="general"]') && Cart.count()) {
          e.preventDefault();
          if (!this.el.classList.contains("open")) this.open();
          this.go("checkout");
          return;
        }
        if (e.target.closest("[data-open-cart]")) { e.preventDefault(); this.open(); }
        else if (e.target.closest("[data-close-cart]")) this.close();
      });
      document.addEventListener("keydown", (e) => {
        if (!this.el.classList.contains("open")) return;
        if (e.key === "Escape") this.close();
        if (e.key === "Tab") this.trap(e);
      });

      $("#cart-items").addEventListener("click", (e) => {
        const li = e.target.closest(".cart-item");
        if (!li) return;
        const it = Cart.items.find((i) => i.key === li.dataset.key);
        const q = e.target.closest("[data-cart-qty]");
        if (q) Cart.setQty(it.key, it.qty + Number(q.dataset.cartQty));
        if (e.target.closest("[data-remove]")) Cart.setQty(it.key, 0);
      });

      $("#cart-next").addEventListener("click", () => this.go("checkout"));
      $("#cart-back").addEventListener("click", () => this.go("items"));
      $("#cart-new").addEventListener("click", () => { Cart.clear(); $("#checkout-form").reset(); this.go("items"); this.close(); });

      const date = $("#co-date");
      date.min = todayISO();
      $("#checkout-form").addEventListener("submit", (e) => { e.preventDefault(); sendOrder(); });
      $("#checkout-form").addEventListener("input", updatePreview);
      $("#checkout-form").addEventListener("change", updatePreview);
      $$("[data-copy-order]", this.el).forEach((b) => b.addEventListener("click", copyOrder));
    },

    open() {
      this.lastFocus = document.activeElement;
      this.backdrop.hidden = false;
      requestAnimationFrame(() => this.backdrop.classList.add("open"));
      this.el.classList.add("open");
      this.el.setAttribute("aria-hidden", "false");
      document.body.classList.add("no-scroll");
      setTimeout(() => this.el.focus(), 60);
    },
    close() {
      this.el.classList.remove("open");
      this.el.setAttribute("aria-hidden", "true");
      this.backdrop.classList.remove("open");
      setTimeout(() => (this.backdrop.hidden = true), 400);
      document.body.classList.remove("no-scroll");
      if (this.step === "done") this.go("items");
      if (this.lastFocus) this.lastFocus.focus({ preventScroll: true });
    },
    go(step) {
      this.step = step;
      $$("[data-step]", this.el).forEach((s) => (s.hidden = s.dataset.step !== step));
      $("#drawer-foot").hidden = step === "done";
      $("#cart-next").hidden = step !== "items";
      $("#cart-send").hidden = step !== "checkout";
      $("#cart-back").hidden = step !== "checkout";
      $("[data-step-label]").textContent = step === "items" ? "Paso 1 de 2" : step === "checkout" ? "Paso 2 de 2" : "¡Listo!";
      $("#cart-title").textContent = step === "items" ? "Tu pedido" : step === "checkout" ? "Datos de entrega" : "Pedido enviado";
      if (step === "checkout") {
        updatePreview();
        setTimeout(() => $("#co-name").focus({ preventScroll: true }), 120);
      }
    },
    trap(e) {
      const f = $$("a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex='-1'])", this.el)
        .filter((n) => n.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    },
  };

  function validate(fields) {
    let firstBad = null;
    fields.forEach((el) => {
      const bad = !el.value.trim();
      el.classList.toggle("invalid", bad);
      if (bad && !firstBad) firstBad = el;
      el.addEventListener("input", () => el.classList.remove("invalid"), { once: true });
    });
    if (firstBad) { firstBad.focus(); return false; }
    return true;
  }

  function buildOrderMessage(form) {
    const fd = new FormData(form);
    const { total, pending } = Cart.totals();
    const lines = Cart.items.map((i) => {
      const r = Cart.resolve(i);
      const extra = lineLabel(r);
      const price = r.option.price != null ? money(r.option.price * i.qty) : "precio a confirmar";
      return `• ${i.qty} × ${r.product.name}${extra ? ` (${extra})` : ""} — ${price}`;
    });

    const out = [
      "Hola Lantana Café Bistró. Quisiera realizar el siguiente pedido:",
      "",
      "*Detalle del pedido*",
      ...lines,
      "",
      `*Total estimado: ${money(total)}*${pending ? " + productos por confirmar" : ""}`,
      "",
      "*Datos de entrega*",
      `Nombre: ${fd.get("nombre").trim() || "—"}`,
      `Zona de entrega: ${fd.get("zona")}`,
    ];
    if (fd.get("direccion").trim()) out.push(`Dirección / referencia: ${fd.get("direccion").trim()}`);
    out.push(`Fecha de entrega: ${fd.get("fecha") ? prettyDate(fd.get("fecha")) : "a coordinar"}`);
    out.push(`Horario: ${fd.get("horario")}`);
    if (fd.get("notas").trim()) out.push(`Notas: ${fd.get("notas").trim()}`);
    out.push("", "¿Me confirman disponibilidad y costo de delivery? ¡Gracias!");
    return out.join("\n");
  }

  function sendOrder() {
    const form = $("#checkout-form");
    if (!Cart.count()) return;
    if (!validate([$("#co-name")])) return;
    lastOrderText = buildOrderMessage(form);
    const url = openWhatsApp(lastOrderText);
    $("#cart-wa-again").href = url;
    Drawer.go("done");
  }

  let lastOrderText = "";

  function updatePreview() {
    if (Drawer.step !== "checkout" || !Cart.count()) return;
    $("#order-preview").textContent = buildOrderMessage($("#checkout-form"));
  }

  async function copyOrder() {
    const text = Drawer.step === "done" ? lastOrderText : buildOrderMessage($("#checkout-form"));
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    toast(`${icon("check")} Pedido copiado. Pégalo en el chat de WhatsApp`);
  }

  /* ---------- Formulario de contacto ---------- */
  function initContact() {
    const form = $("#contact-form");
    const select = $("#cf-product");
    select.innerHTML += D.products.map((p) => `<option>${esc(p.name)}</option>`).join("") + `<option>Otro / pedido especial</option>`;
    $("#cf-date").min = todayISO();

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validate([$("#cf-name"), $("#cf-phone")])) return;
      const fd = new FormData(form);
      const msg = [
        "Hola Lantana Café Bistró. Tengo una consulta:\n",
        `Nombre: ${fd.get("nombre").trim()}`,
        `WhatsApp: ${fd.get("whatsapp").trim()}`,
        fd.get("producto") ? `Producto de interés: ${fd.get("producto")}` : "",
        fd.get("fecha") ? `Fecha requerida: ${prettyDate(fd.get("fecha"))}` : "",
        `Zona de entrega: ${fd.get("zona")}`,
        fd.get("mensaje").trim() ? `\nMensaje: ${fd.get("mensaje").trim()}` : "",
      ].filter(Boolean).join("\n");

      const url = openWhatsApp(msg);
      $("#form-wa-again").href = url;
      $("#form-success").hidden = false;
    });

    $("#form-reset").addEventListener("click", () => {
      form.reset();
      $("#form-success").hidden = true;
      $("#cf-name").focus();
    });
  }

  /* ---------- Testimonios ---------- */
  function initCarousel() {
    $("#demo-note").hidden = !D.testimonialsAreDemo;
    const track = $("#carousel-track");
    const dots = $("#carousel-dots");
    track.innerHTML = D.testimonials.map((t, i) => `
      <figure class="quote" role="group" aria-roledescription="testimonio" aria-label="${i + 1} de ${D.testimonials.length}">
        <blockquote><p>${esc(t.quote)}</p></blockquote>
        <figcaption>${esc(t.author)}${t.detail ? " · " + esc(t.detail) : ""}</figcaption>
      </figure>`).join("");
    dots.innerHTML = D.testimonials.map((_, i) =>
      `<button type="button" aria-label="Ver testimonio ${i + 1}" ${i === 0 ? 'aria-current="true"' : ""}></button>`).join("");

    const slides = $$(".quote", track);
    let index = 0;
    const go = (i) => {
      index = (i + slides.length) % slides.length;
      track.scrollTo({ left: slides[index].offsetLeft - track.offsetLeft, behavior: reduceMotion ? "auto" : "smooth" });
    };
    const sync = () => {
      index = Math.round(track.scrollLeft / track.clientWidth);
      $$("button", dots).forEach((d, i) => (i === index ? d.setAttribute("aria-current", "true") : d.removeAttribute("aria-current")));
    };
    track.addEventListener("scroll", () => requestAnimationFrame(sync), { passive: true });
    dots.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (b) go($$("button", dots).indexOf(b));
    });
    $("[data-carousel='prev']").addEventListener("click", () => go(index - 1));
    $("[data-carousel='next']").addEventListener("click", () => go(index + 1));

    if (!reduceMotion) {
      let timer = setInterval(() => go(index + 1), 6500);
      const root = $("#carousel");
      const stop = () => clearInterval(timer);
      const start = () => { stop(); timer = setInterval(() => go(index + 1), 6500); };
      root.addEventListener("mouseenter", stop);
      root.addEventListener("mouseleave", start);
      root.addEventListener("focusin", stop);
      root.addEventListener("touchstart", stop, { passive: true });
    }
  }

  /* ---------- Música de fondo ---------- */
  function initMusic() {
    const cfg = D.music;
    if (!cfg || !cfg.tracks.length) return;
    const audio = $("#bg-music");
    const btn = $("#music-toggle");
    const PREF_KEY = "lantana-music";

    // Pista según la hora del visitante
    const h = new Date().getHours();
    const track = cfg.tracks.find((t) => (t.from < t.to ? h >= t.from && h < t.to : h >= t.from || h < t.to)) || cfg.tracks[0];
    audio.src = track.src;
    $("#music-moment").textContent = track.label;

    let pref = null;
    try { pref = localStorage.getItem(PREF_KEY); } catch (_) { /* sin almacenamiento */ }
    const savePref = (v) => { try { localStorage.setItem(PREF_KEY, v); } catch (_) { /* */ } };

    let wanted = pref !== "off";
    let fadeTimer, labelTimer;
    // iPhone/iPad: Safari no deja controlar el volumen; ahí todo es instantáneo
    const isIOS = /iP(hone|od|ad)/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    /* Fundido de volumen. En iPhone/iPad, Safari no deja cambiar el volumen
       desde la página: si el volumen no responde, se termina al instante.
       También hay un límite de tiempo para que nunca quede colgado. */
    const fade = (target, done) => {
      clearInterval(fadeTimer);
      const startedAt = Date.now();
      const finish = () => {
        clearInterval(fadeTimer);
        try { audio.volume = target; } catch (_) { /* volumen de solo lectura */ }
        if (done) done();
      };
      fadeTimer = setInterval(() => {
        const diff = target - audio.volume;
        if (Math.abs(diff) <= 0.02 || Date.now() - startedAt > 1500) return finish();
        const before = audio.volume;
        try { audio.volume = Math.min(1, Math.max(0, before + Math.sign(diff) * 0.02)); } catch (_) { /* */ }
        if (audio.volume === before) finish(); // el navegador no permite cambiar el volumen
      }, 70);
    };

    const setUI = (on) => {
      btn.classList.toggle("playing", on);
      btn.setAttribute("aria-pressed", String(on));
      btn.setAttribute("aria-label", on ? "Pausar música de fondo" : "Activar música de fondo");
      if (!btn.classList.contains("invite")) $("#music-state").textContent = on ? "Sonando ahora" : "Escuchar";
      if (on) {
        $("#music-state").textContent = "Sonando ahora";
        btn.classList.remove("invite");
        $("#music-moment").textContent = track.label;
      }
    };
    // Mientras no suene, el botón invita a tocarlo (salvo que el visitante la haya apagado)
    if (pref !== "off") {
      btn.classList.add("invite");
      $("#music-state").textContent = "Música de fondo";
      $("#music-moment").textContent = "Toca para escuchar";
    }

    // La apariencia del botón sigue al audio real (no a suposiciones)
    let fadingOut = false;
    audio.addEventListener("play", () => { if (!fadingOut) setUI(true); });
    audio.addEventListener("pause", () => setUI(false));

    const play = () => {
      fadingOut = false;
      clearInterval(fadeTimer);
      audio.muted = false;
      if (!isIOS) { try { audio.volume = 0; } catch (_) { /* */ } }
      return audio.play().then(() => {
        setUI(true);
        if (!isIOS) fade(cfg.volume);
        btn.classList.add("show-label");
        clearTimeout(labelTimer);
        labelTimer = setTimeout(() => btn.classList.remove("show-label"), 4500);
      }).catch(() => setUI(false));
    };
    const pause = () => {
      // Pausa instantánea al tocar el botón, en todos los dispositivos
      clearInterval(fadeTimer);
      fadingOut = false;
      audio.pause();
      setUI(false);
    };

    const toggle = () => {
      const sounding = !audio.paused && !audio.muted && !fadingOut;
      if (sounding) { wanted = false; savePref("off"); pause(); }
      else { wanted = true; savePref("on"); play(); }
    };
    // En pantallas táctiles se responde al toque mismo: Safari en iPhone
    // no siempre convierte el toque en "click". preventDefault evita el doble disparo.
    btn.addEventListener("touchend", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggle();
    }, { passive: false });
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggle();
    });

    // Los navegadores bloquean el audio hasta que el visitante interactúa:
    // la música empieza con su primer toque, clic o tecla.
    if (wanted) {
      const events = ["pointerup", "touchend", "keydown", "click"];
      const unlock = (e) => {
        events.forEach((ev) => document.removeEventListener(ev, unlock, true));
        if (e.target.closest && e.target.closest("#music-toggle")) return; // el botón ya decide
        if (wanted && audio.paused) play();
      };
      events.forEach((ev) => document.addEventListener(ev, unlock, true));
      play(); // funciona directo si el navegador ya lo permite
    }

    // Pausa al cambiar de pestaña o abrir WhatsApp; retoma al volver
    let resume = false;
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && !audio.paused) { resume = true; audio.pause(); }
      else if (!document.hidden && resume && wanted) { resume = false; play(); }
    });
  }

  /* ---------- Animaciones al hacer scroll ---------- */
  function initReveal() {
    const els = $$(".reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        // Escalonado sutil entre hermanos que aparecen juntos
        const siblings = Array.from(el.parentElement.children).filter((c) => c.classList.contains("reveal"));
        el.style.transitionDelay = Math.min(siblings.indexOf(el), 5) * 90 + "ms";
        el.classList.add("in");
        // Al terminar, se libera la transición para que los hovers respondan al instante
        el.addEventListener("transitionend", () => {
          el.classList.remove("reveal", "in");
          el.style.transitionDelay = "";
        }, { once: true });
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach((el) => io.observe(el));
  }

  /* ---------- Inicio ---------- */
  initCatalog();
  initPeek();
  initToppings();
  wireLinks();
  initHeader();
  Cart.load();
  Drawer.init();
  render();
  initContact();
  initCarousel();
  initReveal();
  initMusic();
  $("#year").textContent = new Date().getFullYear();
})();
