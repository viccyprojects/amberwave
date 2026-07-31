(function () {
  /* ---------- Hero logo shrinks into the corner on scroll ---------- */
  const SHRINK_AT = 140;
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      document.body.classList.toggle("brand-shrunk", window.scrollY > SHRINK_AT);
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Floating Apply button ---------- */
  const floatBtn = document.getElementById("floatApply");
  const heroBtn = document.getElementById("heroApplyBtn");
  const finalBtn = document.getElementById("finalApplyBtn");
  if (!floatBtn) return;

  let heroVisible = true;
  let finalVisible = false;

  function updateFloat() {
    const show = !heroVisible && !finalVisible;
    floatBtn.classList.toggle("show", show);
  }

  if ("IntersectionObserver" in window) {
    if (heroBtn) {
      new IntersectionObserver(
        (entries) => {
          heroVisible = entries[0].isIntersecting;
          updateFloat();
        },
        { threshold: 0 }
      ).observe(heroBtn);
    }
    if (finalBtn) {
      new IntersectionObserver(
        (entries) => {
          finalVisible = entries[0].isIntersecting;
          updateFloat();
        },
        { threshold: 0 }
      ).observe(finalBtn);
    }
  } else {
    // Fallback for very old browsers: just show after scrolling down a bit
    window.addEventListener("scroll", () => {
      floatBtn.classList.toggle("show", window.scrollY > 400);
    });
  }
})();
