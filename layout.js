/* ==========================================================
   layout.js (clean, latest)
   - Loads header/footer partials (no jQuery)
   - Keeps logic minimal: injection + translations + language clicks
   - Emits `dceeny:layout-ready` so script.js can bind dropdown UI safely
========================================================== */

(() => {
  "use strict";

  const STORAGE_LANG_KEY = "preferredLanguage";

  const qs = (sel, root = document) => root.querySelector(sel);

  function isEducationPath() {
    return window.location.pathname.split("/").includes("education");
  }

  function getPreferredLanguage() {
    try {
      return localStorage.getItem(STORAGE_LANG_KEY) || "en";
    } catch {
      return "en";
    }
  }

  async function fetchText(url) {
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
    return await res.text();
  }

  async function injectPartial(targetSelector, url) {
    const target = qs(targetSelector);
    if (!target) return;

    const cacheKey = `partial:${url}`;

    try {
      const cached = sessionStorage.getItem(cacheKey);
      const html = cached || (await fetchText(url));
      if (!cached) sessionStorage.setItem(cacheKey, html);
      target.innerHTML = html;
    } catch (err) {
      console.warn(err);
    }
  }

  function applyTranslationsAfterInject() {
    const lang = getPreferredLanguage();
    if (typeof window.applyTranslations === "function") {
      window.applyTranslations(lang);
    }
  }

  function bindLanguageLinks() {
    // Provide a fallback in case script.js isn't loaded yet; safe to re-bind.
    document.querySelectorAll("[data-lang]").forEach((el) => {
      if (el.dataset.langBound === "1") return;
      el.dataset.langBound = "1";

      el.addEventListener("click", (e) => {
        e.preventDefault();
        const lang = el.getAttribute("data-lang");
        if (!lang) return;

        if (typeof window.switchLanguage === "function") {
          window.switchLanguage(lang);
        } else {
          try { localStorage.setItem(STORAGE_LANG_KEY, lang); } catch {}
          if (typeof window.applyTranslations === "function") window.applyTranslations(lang);
        }
      });
    });
  }

  async function loadLayout() {
    const headerTarget = "#header-container";
    const lightFooterTarget = "#footer";
    const darkFooterTarget = "#darkFooter";

    const headerUrl = isEducationPath() ? "/elements/headerDark.html" : "/elements/header.html";
    const footerUrl = isEducationPath() ? "/elements/footerDark.html" : "/elements/footer.html";

    await Promise.all([
      injectPartial(headerTarget, headerUrl),
      injectPartial(isEducationPath() ? darkFooterTarget : lightFooterTarget, footerUrl),
    ]);

    bindLanguageLinks();
    requestAnimationFrame(applyTranslationsAfterInject);

    // Important: signal that header/footer exist now (so script.js can bind dropdowns)
    window.dispatchEvent(new Event("dceeny:layout-ready"));
  }

  document.addEventListener("DOMContentLoaded", loadLayout);
})();
