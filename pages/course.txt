// ============================================================
// LOADING SCREEN
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  window.onload = () => {
    const loadingScreen = document.getElementById("loading-screen");
    const content = document.getElementById("content");

    loadingScreen.style.transition = "opacity 0.5s";
    loadingScreen.style.opacity = "0";

    setTimeout(() => {
      loadingScreen.style.display = "none";
      if (content) content.style.display = "block";
    }, 500);
  };
});
// ============================================================
// SCROLL-TO-TOP BUTTON
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  const scrollToTopBtn = document.getElementById("scrollToTop");

  if (!scrollToTopBtn) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 500) {
      scrollToTopBtn.classList.add("show");
    } else {
      scrollToTopBtn.classList.remove("show");
    }
  });

  scrollToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
});
let currentSlide = 0;
const slides = document.querySelectorAll(".slide");

function showSlides() {
  slides.forEach((slide) => slide.classList.remove("active"));
  if (slides.length > 0) {
    slides[currentSlide].classList.add("active");
    currentSlide = (currentSlide + 1) % slides.length;
  }
}
setInterval(showSlides, 3000);
window.addEventListener("load", showSlides);

// ============================================================
// NAVBAR DROPDOWN TOGGLE
// ============================================================
function toggleDropdown() {
  const dropdown = document.getElementById("projects-dropdown");
  if (!dropdown) return;

  dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

const projectsBtn = document.getElementById("projects-btn");
if (projectsBtn) {
  projectsBtn.addEventListener("click", toggleDropdown);
}

// Force column layout for small screens
if (window.innerWidth <= 768) {
  const navbar = document.querySelector(".navbar");
  if (navbar) navbar.style.flexDirection = "column";
}

// ============================================================
// SMOOTH SCROLL DOWN FUNCTION
// ============================================================
function scrollDown() {
  const scrollTarget = window.innerHeight;
  const startPosition = window.scrollY;
  const distance = scrollTarget - startPosition;
  const duration = 900;
  const startTime = performance.now();

  function smoothScroll(currentTime) {
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    const newPosition = startPosition + distance * progress;
    window.scrollTo(0, newPosition);
    if (progress < 1) requestAnimationFrame(smoothScroll);
  }

  requestAnimationFrame(smoothScroll);
}
// ============================================================
// BUY COURSE OVERLAY — FINAL WORKING VERSION (SAFE FOR DYNAMIC CONTENT)
// ============================================================

function initBuyOverlay() {
  const buyOverlay = document.getElementById("buyOverlay");
  const closeBuyOverlay = document.getElementById("closeBuyOverlay");
  const buyForm = document.getElementById("buyCourseForm");
  const botToken = "7526772728:AAE8xfyUfEb-zq1KL3uE0OdYlq4wLVdoPAc";
  const chatId = "7285884938";

  if (!buyOverlay || !buyForm) {
    console.warn("Buy overlay or form not found in DOM.");
    return;
  }

  console.log("✅ Buy Overlay initialized.");

  // 🟢 Event delegation — works even if course cards are dynamically added
  document.body.addEventListener("click", (e) => {
    const btn = e.target.closest(".buy-btn");
    if (!btn) return;

    e.preventDefault();

    const card = btn.closest(".course-card");
    const title =
      card?.querySelector(".course-title")?.textContent.trim() ||
      "Unknown Course";

    // Fill course name into hidden input
    const titleInput = document.getElementById("buyCourseTitle");
    if (titleInput) titleInput.value = title;

    // Reset form + thank you message
    buyForm.style.display = "block";
    const thankYou = buyOverlay.querySelector(".buy-thank-you");
    if (thankYou) thankYou.style.display = "none";

    // Show overlay
    buyOverlay.style.display = "flex";
    document.body.style.overflow = "hidden";

    console.log(`🛒 Buy clicked for: ${title}`);
  });

  // 🧩 Close overlay manually
  if (closeBuyOverlay) {
    closeBuyOverlay.addEventListener("click", () => {
      buyOverlay.style.display = "none";
      document.body.style.overflow = "";
      console.log("❌ Overlay closed (manual).");
    });
  }

  // 🧩 Close overlay when clicking outside
  buyOverlay?.addEventListener("click", (e) => {
    if (e.target === buyOverlay) {
      buyOverlay.style.display = "none";
      document.body.style.overflow = "";
      console.log("❌ Overlay closed (outside click).");
    }
  });

  // 🧩 Handle form submission
  buyForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("buyName").value.trim();
    const phone = document.getElementById("buyPhone").value.trim();
    const city = document.getElementById("buyCity").value.trim();
    const type = document.getElementById("buyCourseType").value;
    const course = document.getElementById("buyCourseTitle").value.trim();
    const message = document.getElementById("buyMessage").value.trim();

    let valid = true;
    document
      .querySelectorAll(".buy-error-message")
      .forEach((el) => (el.style.display = "none"));

    if (!name) {
      document.querySelector("#buyName + .buy-error-message").style.display =
        "block";
      valid = false;
    }
    if (!phone) {
      document.querySelector("#buyPhone + .buy-error-message").style.display =
        "block";
      valid = false;
    }
    if (!city) {
      document.querySelector("#buyCity + .buy-error-message").style.display =
        "block";
      valid = false;
    }
    if (!type) {
      document.querySelector("#buyCourseType + .buy-error-message").style.display =
        "block";
      valid = false;
    }

    if (!valid) return;

    const telegramMsg = `*New Course Purchase:*\n📘 Course: ${course}\n🎓 Type: ${type}\n👤 Name: ${name}\n📞 Phone: ${phone}\n📍 City: ${city}\n📝 Message: ${
      message || "None"
    }`;

    try {
      console.log("📤 Sending Telegram message...");
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: telegramMsg,
            parse_mode: "Markdown",
          }),
        }
      );

      if (response.ok) {
        buyForm.style.display = "none";
        buyOverlay.querySelector(".buy-thank-you").style.display = "block";
        console.log("✅ Telegram message sent successfully.");
      } else {
        alert("Error sending message. Please try again later.");
        console.error("❌ Telegram API responded with error.");
      }
    } catch (err) {
      alert("Connection error. Please check your internet connection.");
      console.error("❌ Network error while sending Telegram message:", err);
    }
  });
}

// 🟢 Initialize overlay AFTER all content loads (including jQuery header/footer)
window.addEventListener("load", () => {
  setTimeout(() => {
    console.log("🚀 Initializing Buy Overlay after full load...");
    initBuyOverlay();
  }, 800); // short delay ensures dynamic content is in DOM
});

// ============================================================
// COURSE CARD CLICK NAVIGATION (EXCLUDING BUY BUTTON)
// ============================================================
document.addEventListener("click", (e) => {
  const buyButton = e.target.closest(".buy-btn");
  if (buyButton) return; // ignore clicks on the Buy button

  const card = e.target.closest(".course-card");
  if (card && card.dataset.link) {
    window.location.href = card.dataset.link;
  }
});


// ============================================================
// COURSE PAGE INTERACTIONS
// ============================================================

// 1️⃣ YouTube Embed Loader
document.addEventListener("DOMContentLoaded", () => {
  const holder = document.getElementById("video-embed");
  if (!holder) return;
  const id = holder.dataset.youtubeId;

  if (!id || id === "YOUTUBE_VIDEO_ID") {
    holder.innerHTML = `
      <div style="position:absolute;inset:0;display:grid;place-items:center;color:#fff;text-align:center;">
        <p>Replace <strong>data-youtube-id</strong> with your YouTube video ID.</p>
      </div>`;
    return;
  }

  const iframe = document.createElement("iframe");
  iframe.src = `https://www.youtube.com/embed/${id}?rel=0&showinfo=0`;
  iframe.allowFullscreen = true;
  iframe.allow =
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
  holder.appendChild(iframe);
});

// 2️⃣ Collapsible Chapters (works even if added later)
function initCourseChapters() {
  const chapters = document.querySelectorAll(".chapter.collapsible");

  chapters.forEach((chapter) => {
    const index = chapter.dataset.index;
    const list = document.getElementById(`episodes-${index}`);

    if (!list) return;

    chapter.addEventListener("click", () => {
      const isOpen = chapter.getAttribute("aria-expanded") === "true";
      chapter.setAttribute("aria-expanded", !isOpen);
      list.classList.toggle("open", !isOpen);
      list.setAttribute("aria-hidden", isOpen);
    });
  });
}

window.addEventListener("load", initCourseChapters);

// 3️⃣ Demo Buy Overlay (optional)
document.querySelectorAll(".buy-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const title =
      btn.dataset.courseTitle ||
      btn.closest(".course-card")?.querySelector(".course-title")?.textContent ||
      "Course";
    const overlay = document.getElementById("demoBuyOverlay");
    if (!overlay) return;

    document.getElementById("demoCourseTitle").textContent = title;
    overlay.style.display = "flex";
  });
});

function closeDemoBuy() {
  const overlay = document.getElementById("demoBuyOverlay");
  if (overlay) overlay.style.display = "none";
}

function confirmBuy() {
  alert("Demo purchase confirmed (replace with real logic).");
  closeDemoBuy();
}

// ============================================================
// STICKY BUY BAR VISIBILITY CONTROL
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  const stickyBar = document.querySelector(".sticky-buy-bar");
  const sidebarBuyButton = document.querySelector(".sidebar .buy-btn");

  if (!stickyBar || !sidebarBuyButton) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          stickyBar.classList.add("hide-sticky");
        } else {
          stickyBar.classList.remove("hide-sticky");
        }
      });
    },
    { threshold: 0.2 }
  );

  observer.observe(sidebarBuyButton);
});


  // When sticky "Buy Now" is clicked, trigger the sidebar's buy button click
  document.addEventListener("DOMContentLoaded", () => {
    const stickyBtn = document.getElementById("stickyBuyBtn");
    const sidebarBtn = document.querySelector(".buy-btn");

    if (stickyBtn && sidebarBtn) {
      stickyBtn.addEventListener("click", () => sidebarBtn.click());
    }
  });

