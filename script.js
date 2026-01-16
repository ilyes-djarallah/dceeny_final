/* ==========================================================
   dceeny.com — script.js (global)
   - No jQuery
   - Defensive (safe on pages that don't have certain sections)
   - Handles: scroll-to-top, navbar dropdowns, slideshow, forms, course UI helpers
========================================================== */

(() => {
  "use strict";
  document.addEventListener("DOMContentLoaded", () => {
    initLoadingScreen();
    initScrollToTop();
    initNavbarDropdowns();
    initSmoothScroll();
    initSlideshow();
    initProfessionalForm();
    initBuyOverlay(); // (education pages) optional
    initCourseSearch(); // (education listing) optional
    initCourseCardNavigation(); // (education listing) optional
    initCourseChapters(); // (course detail) optional
  });

  /* ==========================================================
     1) Loading screen (optional)
  ========================================================== */
  function initLoadingScreen() {
    const loader = document.getElementById("loading-screen");
    if (!loader) return;

    // Hide after full load to avoid flashing unstyled content.
    window.addEventListener("load", () => {
      loader.style.opacity = "0";
      setTimeout(() => {
        loader.style.display = "none";
      }, 250);
    });
  }

  /* ==========================================================
     2) Scroll to top button
  ========================================================== */
  function initScrollToTop() {
    const btn = document.getElementById("scrollToTop");
    if (!btn) return;

    const onScroll = () => {
      if (window.scrollY > 300) btn.classList.add("show");
      else btn.classList.remove("show");
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ==========================================================
     3) Navbar dropdowns (Projects + Language)
     - Works with injected header
     - No duplicated handlers (bind-once guard)
     - Closes on outside click + Escape
  ========================================================== */
  function initNavbarDropdowns() {
    const OPEN_CLASS = "show-dropdown";
    const BOUND_FLAG = "navDropdownsBound";

    const bind = () => {
      const projectsBtn = document.getElementById("projects-btn");
      const projectsMenu = document.getElementById("projects-dropdown");

      const lgeBtn = document.getElementById("lge-btn");
      const lgeMenu = document.getElementById("language-menu");

      // If header isn't present yet, binding cannot occur
      if (!projectsBtn && !lgeBtn) return false;

      // Prevent double-binding across re-inits
      if (document.documentElement.dataset[BOUND_FLAG] === "1") return true;
      document.documentElement.dataset[BOUND_FLAG] = "1";

      const closeAll = () => {
        projectsMenu?.classList.remove(OPEN_CLASS);
        lgeMenu?.classList.remove(OPEN_CLASS);

        projectsBtn?.setAttribute("aria-expanded", "false");
        lgeBtn?.setAttribute("aria-expanded", "false");
      };

      const toggle = (btn, menu) => {
        if (!btn || !menu) return;
        const wasOpen = menu.classList.contains(OPEN_CLASS);
        closeAll();
        if (!wasOpen) {
          menu.classList.add(OPEN_CLASS);
          btn.setAttribute("aria-expanded", "true");
        }
      };

      // A11y attributes (safe even if already present)
      if (projectsBtn) {
        projectsBtn.setAttribute("aria-haspopup", "true");
        projectsBtn.setAttribute("aria-expanded", "false");
      }
      if (lgeBtn) {
        lgeBtn.setAttribute("aria-haspopup", "true");
        lgeBtn.setAttribute("aria-expanded", "false");
      }

      // Toggle handlers
      projectsBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(projectsBtn, projectsMenu);
      });

      lgeBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(lgeBtn, lgeMenu);
      });

      // Close on outside click
      document.addEventListener("click", (e) => {
        const t = e.target;

        if (
          projectsBtn?.contains(t) ||
          projectsMenu?.contains(t) ||
          lgeBtn?.contains(t) ||
          lgeMenu?.contains(t)
        ) {
          return;
        }
        closeAll();
      });

      // Close on Escape
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeAll();
      });

      return true;
    };

    // Bind immediately if possible
    if (bind()) return;

    // Bind right after layout injection
    window.addEventListener("dceeny:layout-ready", bind, { once: true });

    // Safety fallback (if event missed due to script ordering)
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      if (bind() || tries >= 25) window.clearInterval(timer);
    }, 100);
  }

/* ==========================================================
     4) Scroll down button (homepage)
     - Supports inline onclick="scrollDown()" used in your homepage markup
  ========================================================== */
  // window.scrollDown = function scrollDown() {
  //   // Prefer scrolling to the next section if it exists
  //   const nextSection =
  //     document.querySelector('[data-scroll-target="after-hero"]') ||
  //     document.querySelector("#after-hero") ||
  //     document.querySelector("main") ||
  //     document.querySelector("section");

  //   if (nextSection) {
  //     nextSection.scrollIntoView({ behavior: "smooth", block: "start" });
  //     return;
  //   }

  //   // Fallback: scroll one viewport height
  //   window.scrollBy({
  //     top: window.innerHeight * 0.9,
  //     left: 0,
  //     behavior: "smooth",
  //   });
  // };
  window.scrollDown = function scrollDown() {
    // Responsive scroll distance (professional clamp)
    const distance = Math.min(
      1100,
      Math.max(800, Math.round(window.innerHeight * 0.9))
    );

    // Slower, user-friendly duration (increase for slower)
    const duration = 1100; // 1100ms feels smoother than 900

    const startPosition = window.scrollY;
    const targetPosition = startPosition + distance;
    const startTime = performance.now();

    // Ease in/out for a premium feel
    const easeInOutCubic = (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    function smoothScroll(currentTime) {
      const elapsed = currentTime - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = easeInOutCubic(t);

      window.scrollTo(
        0,
        startPosition + (targetPosition - startPosition) * eased
      );

      if (t < 1) requestAnimationFrame(smoothScroll);
    }

    requestAnimationFrame(smoothScroll);
  };

  /* ==========================================================
     4) Smooth scroll for internal anchors
  ========================================================== */
  function initSmoothScroll() {
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;

      const href = a.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  /* ==========================================================
     5) Slideshow (home pages)
     Supports:
     - <img class="slide" src="..."> (basic)
     - <img class="slide" data-src="..."> (best; enables true lazy loading with HTML patch)
  ========================================================== */
  function initSlideshow() {
    const container = document.querySelector(".slideshow-container");
    if (!container) return;
    // Prevent multiple intervals if init runs twice
    if (container.dataset.slideshowInit === "1") return;
    container.dataset.slideshowInit = "1";
    const slides = Array.from(container.querySelectorAll("img.slide"));
    if (slides.length === 0) return;

    // Basic image decode hints (safe even if already loaded)
    slides.forEach((img, i) => {
      img.decoding = "async";
      if (i === 0) {
        img.loading = "eager";
        try {
          img.fetchPriority = "high";
        } catch {}
      } else {
        img.loading = "lazy";
      }
    });

    let index = 0;

    // Ensure the active slide has a real src (if using data-src)
    const ensureLoaded = (img) => {
      if (!img) return;

      const dataSrc = img.getAttribute("data-src");
      if (!dataSrc) return;

      const src = img.getAttribute("src") || "";

      // Detect placeholder (1x1 transparent gif)
      const isPlaceholder =
        src.startsWith("data:image/gif") || src.includes("R0lGODlhAQABAIA");

      if (isPlaceholder || src === "") {
        img.setAttribute("src", dataSrc);
        img.removeAttribute("data-src");
      }
    };

    const show = (i) => {
      slides.forEach((img, k) => {
        img.classList.toggle("active", k === i);
      });

      ensureLoaded(slides[i]);

      const next = slides[(i + 1) % slides.length];
      const nextSrc = next.getAttribute("data-src") || next.getAttribute("src");
      if (nextSrc) {
        const pre = new Image();
        pre.src = nextSrc;
      }
    };

    show(index);

    // Rotate every 5s (adjust if desired)
    setInterval(() => {
      index = (index + 1) % slides.length;
      show(index);
    }, 5000);
  }

  /* ==========================================================
     6) About-us "Join Us" form
     IMPORTANT: Do NOT put Telegram tokens in frontend.
     This implementation:
     - validates
     - opens WhatsApp with a prefilled message (safe)
     - shows thank-you message
  ========================================================== */
  function initProfessionalForm() {
    const form = document.getElementById("professionalForm");
    if (!form) return;

    const thankYou = document.querySelector(".thank-you-message");
    const fullName = document.getElementById("fullName");
    const phone = document.getElementById("phoneNumber");
    const profession = document.getElementById("profession");

    const showError = (input, show) => {
      const group = input?.closest(".input-group");
      if (!group) return;
      const msg = group.querySelector(".error-message");
      if (!msg) return;
      msg.style.display = show ? "block" : "none";
    };

    const validate = () => {
      let ok = true;

      if (!fullName?.value.trim()) {
        ok = false;
        showError(fullName, true);
      } else showError(fullName, false);
      if (!phone?.value.trim()) {
        ok = false;
        showError(phone, true);
      } else showError(phone, false);
      if (!profession?.value) {
        ok = false;
        showError(profession, true);
      } else showError(profession, false);

      return ok;
    };

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validate()) return;

      const msg =
        "Join Dceeny — Professional Application\n\n" +
        `Full name: ${fullName.value.trim()}\n` +
        `Phone: ${phone.value.trim()}\n` +
        `Profession: ${profession.value}\n` +
        `Page: ${location.href}`;

      // WhatsApp (change number if desired)
      const waNumber = "213550949139"; // no "+"
      const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
      window.open(url, "_blank", "noopener");

      form.reset();
      if (thankYou) {
        thankYou.style.display = "block";
        setTimeout(() => {
          thankYou.style.display = "none";
        }, 8000);
      }
    });

    // Hide errors while typing
    [fullName, phone, profession].forEach((el) => {
      if (!el) return;
      el.addEventListener("input", () => showError(el, false));
      el.addEventListener("change", () => showError(el, false));
    });
  }

  /* ==========================================================
     7) Education: buy overlay (optional)
     - expects elements:
       #buyOverlay, #buyOverlayClose, .buy-course-btn, etc (if present)
  ========================================================== */
  function initBuyOverlay() {
    const overlay = document.getElementById("buyOverlay");
    if (!overlay) return;

    const closeBtn = document.getElementById("buyOverlayClose");
    const openBtns = document.querySelectorAll(
      ".buy-course-btn, [data-buy-course]"
    );

    const open = () => overlay.classList.add("open");
    const close = () => overlay.classList.remove("open");

    openBtns.forEach((b) =>
      b.addEventListener("click", (e) => {
        e.preventDefault();
        open();
      })
    );

    if (closeBtn) closeBtn.addEventListener("click", close);

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

  /* ==========================================================
     8) Education: course search (optional)
  ========================================================== */
  function initCourseSearch() {
    const input = document.getElementById("courseSearch");
    if (!input) return;

    const cards = Array.from(
      document.querySelectorAll(".course-card, [data-course-card]")
    );
    if (cards.length === 0) return;

    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      cards.forEach((card) => {
        const text = (card.innerText || "").toLowerCase();
        card.style.display = text.includes(q) ? "" : "none";
      });
    });
  }

  /* ==========================================================
     9) Education: card navigation (optional)
  ========================================================== */
  function initCourseCardNavigation() {
    document.addEventListener("click", (e) => {
      const card = e.target.closest(
        ".course-card[data-href], [data-course-card][data-href]"
      );
      if (!card) return;
      const href = card.getAttribute("data-href");
      if (!href) return;
      window.location.href = href;
    });
  }

  /* ==========================================================
     10) Course chapters accordion (optional)
  ========================================================== */
  function initCourseChapters() {
    const toggles = document.querySelectorAll("[data-chapter-toggle]");
    if (toggles.length === 0) return;

    toggles.forEach((t) => {
      t.addEventListener("click", () => {
        const id = t.getAttribute("data-chapter-toggle");
        const panel = document.getElementById(id);
        if (!panel) return;

        const isOpen = panel.classList.toggle("open");
        t.setAttribute("aria-expanded", String(isOpen));
      });
    });
  }
})();
