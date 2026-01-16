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

  // async function fetchText(url) {
  //   const res = await fetch(url, { cache: "force-cache" });
  //   if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  //   return await res.text();
  // }

  // async function injectPartial(targetSelector, url) {
  //   const target = qs(targetSelector);
  //   if (!target) return;

  //   const cacheKey = `partial:${url}`;

  //   try {
  //     const cached = sessionStorage.getItem(cacheKey);
  //     const html = cached || (await fetchText(url));
  //     if (!cached) sessionStorage.setItem(cacheKey, html);
  //     target.innerHTML = html;
  //   } catch (err) {
  //     console.warn(err);
  //   }
  // }
  async function fetchText(url) {
    const res = await fetch(url, {
      cache: "no-store", // 🔴 disables browser cache
    });
    if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
    return await res.text();
  }

  async function injectPartial(targetSelector, url) {
    const target = document.querySelector(targetSelector);
    if (!target) return;

    try {
      const html = await fetchText(url);
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
          try {
            localStorage.setItem(STORAGE_LANG_KEY, lang);
          } catch {}
          if (typeof window.applyTranslations === "function")
            window.applyTranslations(lang);
        }
      });
    });
  }

  async function loadLayout() {
    const headerTarget = "#header-container";
    const lightFooterTarget = "#footer";
    const darkFooterTarget = "#darkFooter";

    const headerUrl = isEducationPath()
      ? "/elements/headerDark.html"
      : "/elements/header.html";
    const footerUrl = isEducationPath()
      ? "/elements/footerDark.html"
      : "../elements/footer.html";

    await Promise.all([
      injectPartial(headerTarget, headerUrl),
      injectPartial(
        isEducationPath() ? darkFooterTarget : lightFooterTarget,
        footerUrl
      ),
    ]);

    bindLanguageLinks();
    requestAnimationFrame(applyTranslationsAfterInject);

    // Important: signal that header/footer exist now (so script.js can bind dropdowns)
    window.dispatchEvent(new Event("dceeny:layout-ready"));
  }

  document.addEventListener("DOMContentLoaded", loadLayout);
})();
function initNavbarDropdowns() {
  const bind = () => {
    const projectsBtn = document.getElementById("projects-btn");
    const projectsDropdown = document.getElementById("projects-dropdown");

    const lgeBtn = document.getElementById("lge-btn");
    const lgeMenu = document.querySelector(".dropdown-lge-menu");

    // Header still not present yet
    if (!projectsBtn && !lgeBtn) return false;

    // Prevent double-binding if init runs multiple times
    if (document.documentElement.dataset.navDropdownsBound === "1") return true;
    document.documentElement.dataset.navDropdownsBound = "1";

    const closeAllDropdowns = () => {
      projectsDropdown?.classList.remove("show-dropdown");
      lgeMenu?.classList.remove("show-dropdown");
      projectsBtn?.setAttribute("aria-expanded", "false");
      lgeBtn?.setAttribute("aria-expanded", "false");
    };

    // Projects
    if (projectsBtn && projectsDropdown) {
      projectsBtn.setAttribute("aria-haspopup", "true");
      projectsBtn.setAttribute("aria-expanded", "false");

      projectsBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const isOpen = projectsDropdown.classList.contains("show-dropdown");
        closeAllDropdowns();
        if (!isOpen) {
          projectsDropdown.classList.add("show-dropdown");
          projectsBtn.setAttribute("aria-expanded", "true");
        }
      });
    }

    // Language
    if (lgeBtn && lgeMenu) {
      lgeBtn.setAttribute("aria-haspopup", "true");
      lgeBtn.setAttribute("aria-expanded", "false");

      lgeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const isOpen = lgeMenu.classList.contains("show-dropdown");
        closeAllDropdowns();
        if (!isOpen) {
          lgeMenu.classList.add("show-dropdown");
          lgeBtn.setAttribute("aria-expanded", "true");
        }
      });

      lgeMenu.addEventListener("click", (e) => {
        const link = e.target.closest("[data-lang]");
        if (!link) return;

        e.preventDefault();
        const lang = link.getAttribute("data-lang");

        if (typeof window.switchLanguage === "function") {
          window.switchLanguage(lang);
        }
        closeAllDropdowns();
      });
    }

    // Close on outside click / Esc
    document.addEventListener("click", closeAllDropdowns);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAllDropdowns();
    });

    return true;
  };

  // Try now
  if (bind()) return;

  // If header is injected shortly after DOMContentLoaded, retry a few times
  let tries = 0;
  const t = setInterval(() => {
    tries += 1;
    if (bind() || tries >= 20) clearInterval(t); // ~2 seconds max
  }, 100);

  // Also bind when layout injection finishes (best case)
  document.addEventListener("dceeny:layout-ready", () => {
    bind();
  });
}

function makeDropdown({ trigger, menu, enabled, openClass }) {
  const isEnabled = () => (typeof enabled === "function" ? enabled() : true);

  const close = () => {
    trigger.setAttribute("aria-expanded", "false");
    menu.classList.remove(openClass);
  };

  const open = () => {
    trigger.setAttribute("aria-expanded", "true");
    menu.classList.add(openClass);
  };

  const toggle = () => {
    if (!isEnabled()) return; // mobile uses always-visible menu
    const expanded = trigger.getAttribute("aria-expanded") === "true";
    expanded ? close() : open();
  };

  // a11y
  trigger.setAttribute("aria-haspopup", "true");
  trigger.setAttribute("aria-expanded", "false");

  trigger.addEventListener("click", (e) => {
    e.preventDefault();
    toggle();
  });

  document.addEventListener("click", (e) => {
    if (!isEnabled()) return;
    if (e.target === trigger || trigger.contains(e.target)) return;
    if (menu.contains(e.target)) return;
    close();
  });

  document.addEventListener("keydown", (e) => {
    if (!isEnabled()) return;
    if (e.key === "Escape") close();
  });

  // Close when switching between desktop/mobile sizes
  window.addEventListener("resize", () => {
    if (!isEnabled()) close();
  });
}
