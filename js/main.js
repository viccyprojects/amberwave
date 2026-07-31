/* =========================================================
   AMBERWAVE — shared site behaviour
   ========================================================= */

/* ---------- Mobile nav ---------- */
(function navToggle() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => {
    toggle.classList.toggle("open");
    links.classList.toggle("open");
  });
  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      toggle.classList.remove("open");
      links.classList.remove("open");
    })
  );
})();

/* ---------- Scroll reveal ---------- */
(function scrollReveal() {
  const items = document.querySelectorAll("[data-reveal]");
  if (!items.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in-view");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );
  items.forEach((el) => io.observe(el));
})();

/* ---------- Signature element: animated signal / waveform line ----------
   Draws a bar-style audio waveform on every <canvas class="signal-line">.
   Idles with a gentle ambient pulse, and gains amplitude/speed briefly
   whenever the user scrolls — the page literally "picks up signal". ---- */
(function signalLines() {
  const canvases = document.querySelectorAll(".signal-line");
  if (!canvases.length) return;

  let scrollEnergy = 0;
  let lastY = window.scrollY;
  window.addEventListener(
    "scroll",
    () => {
      const dy = Math.abs(window.scrollY - lastY);
      lastY = window.scrollY;
      scrollEnergy = Math.min(1, scrollEnergy + dy / 240);
    },
    { passive: true }
  );

  const instances = Array.from(canvases).map((canvas) => {
    const ctx = canvas.getContext("2d");
    const bars = 64;
    const phase = Math.random() * Math.PI * 2;
    function resize() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * devicePixelRatio;
      canvas.height = rect.height * devicePixelRatio;
    }
    resize();
    window.addEventListener("resize", resize);
    return { canvas, ctx, bars, phase };
  });

  const emberColor = "#ff6a3d";
  const signalColor = "#c6ff4d";
  let t = 0;

  function draw() {
    t += 0.045;
    scrollEnergy *= 0.94; // decay
    const amp = 0.16 + scrollEnergy * 0.8;

    instances.forEach(({ canvas, ctx, bars, phase }) => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const gap = w / bars;
      for (let i = 0; i < bars; i++) {
        const n =
          Math.sin(t + i * 0.4 + phase) * 0.6 +
          Math.sin(t * 1.7 + i * 0.15) * 0.4;
        const barH = Math.max(2, Math.abs(n) * amp * h);
        const x = i * gap + gap * 0.25;
        const y = (h - barH) / 2;
        ctx.fillStyle = i % 7 === 0 ? signalColor : emberColor;
        ctx.globalAlpha = 0.55 + Math.abs(n) * 0.45;
        ctx.fillRect(x, y, gap * 0.5, barH);
      }
    });
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

/* ---------- Live-editable stats (reads Firestore siteConfig/home) ----------
   Falls back silently to whatever is already in the HTML if Firebase
   isn't configured yet, or the site content hasn't been customised. ---- */
(function liveStats() {
  const statNodes = document.querySelectorAll("[data-stat]");
  if (!statNodes.length || typeof db === "undefined") return;

  db.collection("siteConfig")
    .doc("home")
    .get()
    .then((doc) => {
      if (!doc.exists) return;
      const data = doc.data();
      statNodes.forEach((node) => {
        const key = node.getAttribute("data-stat");
        const wrap = node.closest(".stat");
        if (data[key + "Visible"] === false) {
          if (wrap) wrap.hidden = true;
          return;
        }
        if (data[key]) node.textContent = data[key];
      });
    })
    .catch(() => {
      /* Firebase not configured yet — keep static defaults */
    });
})();
