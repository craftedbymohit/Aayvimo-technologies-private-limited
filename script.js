/* ============================================================
   Aayvimo Technologies â€” script.js
   ============================================================ */

/* â”€â”€ Navbar Scroll Effect â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function initNavbar() {
  const nav = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 10) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }
  }, { passive: true });
}

/* â”€â”€ Mobile Menu â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function initMobileMenu() {
  const ham = document.getElementById("hamburger");
  const menu = document.getElementById("mobile-menu");
  if (!ham || !menu) return;

  ham.addEventListener("click", () => {
    ham.classList.toggle("open");
    menu.classList.toggle("open");
  });
}

function closeMobileMenu() {
  const ham = document.getElementById("hamburger");
  const menu = document.getElementById("mobile-menu");
  if (ham) ham.classList.remove("open");
  if (menu) menu.classList.remove("open");
}

/* â”€â”€ Hero Particles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function initParticles() {
  const container = document.getElementById("hero-particles");
  if (!container) return;

  for (let i = 0; i < 25; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    const size = Math.random() * 3 + 1.5;
    const x = Math.random() * 100;
    const dur = Math.random() * 14 + 10;
    const delay = Math.random() * -25;
    const dx = (Math.random() - 0.5) * 100;
    const isOrange = Math.random() > 0.65;
    const col = isOrange ? "#F97316" : "#0A66C2";

    p.style.cssText = [
      "width:" + size + "px",
      "height:" + size + "px",
      "left:" + x + "%",
      "bottom:0",
      "background:" + col,
      "border-radius:50%",
      "position:absolute",
      "pointer-events:none",
      "opacity:0.6",
      "--dx:" + dx + "px",
      "animation:particleFloat " + dur + "s linear " + delay + "s infinite"
    ].join(";");

    container.appendChild(p);
  }
}

/* â”€â”€ Counter Animation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || "";
  let current = 0;
  const totalSteps = 50;
  const stepValue = target / totalSteps;
  const stepTime = 1400 / totalSteps;

  const timer = setInterval(() => {
    current = Math.min(current + stepValue, target);
    el.textContent = Math.floor(current) + suffix;
    if (current >= target) {
      el.textContent = target + suffix;
      clearInterval(timer);
    }
  }, stepTime);
}

function initCounters() {
  const heroSection = document.getElementById("hero");
  if (!heroSection) return;

  const obs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      document.querySelectorAll(".stat-num[data-target]").forEach(animateCounter);
      obs.disconnect();
    }
  }, { threshold: 0.3 });

  obs.observe(heroSection);
}

/* â”€â”€ Scroll Reveal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function initScrollReveal() {
  const elements = document.querySelectorAll(".reveal");
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

  elements.forEach((el) => obs.observe(el));
}

/* â”€â”€ Active Nav Link on Scroll â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function initActiveNavLink() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-links a");

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === "#" + entry.target.id) {
            link.classList.add("active");
          }
        });
      }
    });
  }, { threshold: 0.45 });

  sections.forEach((sec) => obs.observe(sec));
}

/* â”€â”€ Contact Form Submit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function initContactForm() {
  const btn = document.getElementById("form-submit-btn");
  if (!btn) return;

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const name = document.getElementById("form-name").value.trim();
    const email = document.getElementById("form-email").value.trim();

    if (!name || !email) {
      btn.textContent = "âš ï¸  Please fill in your name and email.";
      btn.style.background = "linear-gradient(135deg, #F97316, #d96010)";
      setTimeout(() => {
        btn.textContent = "ðŸš€ Send Message & Get a Free Quote";
        btn.style.background = "";
      }, 2500);
      return;
    }

    btn.textContent = "âœ… Message Sent! We'll be in touch within 24 hrs.";
    btn.style.background = "linear-gradient(135deg, #22C55E, #16a34a)";
    btn.disabled = true;
  });
}

/* â”€â”€ Smooth Scroll for anchor links â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) {
        e.preventDefault();
        closeMobileMenu();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

/* â”€â”€ Testimonials Pause on Hover â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function initTestimonialsTrack() {
  const track = document.getElementById("testimonials-track");
  if (!track) return;

  track.addEventListener("mouseenter", () => {
    track.style.animationPlayState = "paused";
  });
  track.addEventListener("mouseleave", () => {
    track.style.animationPlayState = "running";
  });
}

/* â”€â”€ Workflow Step Hover â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function initWorkflowSteps() {
  document.querySelectorAll(".wf-step").forEach((step, index) => {
    step.style.transitionDelay = (index * 0.08) + "s";
  });
}

/* â”€â”€ Init All â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
document.addEventListener("DOMContentLoaded", () => {

  initNavbar();
  initMobileMenu();
  initParticles();
  initCounters();
  initScrollReveal();
  initActiveNavLink();
  initContactForm();
  initSmoothScroll();
  initTestimonialsTrack();
  initWorkflowSteps();
});
