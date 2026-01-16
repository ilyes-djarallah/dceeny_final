/* ==========================================================
   dceeny.com — layout.js (CLEAN)
   Responsibilities:
   - Inject shared header/footer partials
   - Apply translations after injection (if translations.js is present)
   - Bind language links (safe to re-bind)
   - Emit `dceeny:layout-ready` on window when layout is in the DOM
========================================================== */

(() => {
  "use strict";

  const STORAGE_LANG_KEY = "preferredLanguage";

  const qs = (sel, root = document) => root.querySelector(sel);

  function isEducationPath() {
    // Keep your existing convention (folder-based routing)
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
    // Per your preference: always re-fetch (disable browser cache)
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
    return await res.text();
  }

  async function injectPartial(targetSelector, url) {
    const target = qs(targetSelector);
    if (!target) return false;

    try {
      const html = await fetchText(url);
      target.innerHTML = html;
      return true;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }

  function applyTranslationsAfterInject() {
    const lang = getPreferredLanguage();
    if (typeof window.applyTranslations === "function") {
      window.applyTranslations(lang);
    }
  }

  function bindLanguageLinks() {
    // Safe to call multiple times (guards via data attribute)
    document.querySelectorAll("[data-lang]").forEach((el) => {
      if (el.dataset.langBound === "1") return;
      el.dataset.langBound = "1";

      el.addEventListener("click", (e) => {
        e.preventDefault();
        const lang = el.getAttribute("data-lang");
        if (!lang) return;

        if (typeof window.switchLanguage === "function") {
          window.switchLanguage(lang);
          return;
        }

        // Minimal fallback
        try {
          localStorage.setItem(STORAGE_LANG_KEY, lang);
        } catch {}
        if (typeof window.applyTranslations === "function") {
          window.applyTranslations(lang);
        }
      });
    });
  }

  async function loadLayout() {
    const headerTarget = "#header-container";
    const footerTarget = "#footer";

    // IMPORTANT: absolute paths so it works from any folder depth
    const headerUrl = isEducationPath()
      ? "/elements/headerDark.html"
      : "/elements/header.html";

    const footerUrl = isEducationPath()
      ? "/elements/footerDark.html"
      : "/elements/footer.html";

    await Promise.all([
      injectPartial(headerTarget, headerUrl),
      injectPartial(footerTarget, footerUrl),
    ]);

    bindLanguageLinks();
    requestAnimationFrame(applyTranslationsAfterInject);

    // Use a single, consistent target: window
    window.dispatchEvent(new Event("dceeny:layout-ready"));
  }

  document.addEventListener("DOMContentLoaded", loadLayout);
})();
