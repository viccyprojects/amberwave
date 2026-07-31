(function () {
  const KEY = "aw_cookie_consent";
  const banner = document.getElementById("cookieBanner");
  if (!banner) return;
  if (localStorage.getItem(KEY)) return;

  setTimeout(() => {
    banner.hidden = false;
  }, 1200);

  const learnMore = document.getElementById("cookieLearnMore");
  const more = document.getElementById("cookieMore");
  if (learnMore && more) {
    learnMore.addEventListener("click", (e) => {
      e.preventDefault();
      more.hidden = !more.hidden;
    });
  }

  const acceptBtn = document.getElementById("cookieAccept");
  if (acceptBtn) {
    acceptBtn.addEventListener("click", () => {
      localStorage.setItem(KEY, "accepted");
      banner.hidden = true;
    });
  }
})();
