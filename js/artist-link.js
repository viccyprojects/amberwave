/* =========================================================
   AMBERWAVE — artist smart-link page (artist.html)
   Reads ?slug=xxx, loads the matching "artists" doc, and
   renders a row per platform the admin has enabled + given a URL.
   ========================================================= */
(function () {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const list = document.getElementById("slList");
  const empty = document.getElementById("slEmpty");
  const titleEl = document.getElementById("slTitle");
  const cover = document.getElementById("slCover");

  if (!slug || typeof db === "undefined") {
    titleEl.textContent = "Artist not found";
    return;
  }

  db.collection("artists")
    .where("slug", "==", slug)
    .limit(1)
    .get()
    .then((snap) => {
      if (snap.empty) {
        // fall back to treating the slug as a doc id
        return db.collection("artists").doc(slug).get().then((doc) => {
          if (!doc.exists) throw new Error("not found");
          render(doc.data());
        });
      }
      render(snap.docs[0].data());
    })
    .catch(() => {
      titleEl.textContent = "Artist not found";
    });

  function render(data) {
    document.getElementById("pageTitle").textContent = (data.name || "Artist") + " — Amberwave";
    titleEl.textContent = data.name || "";
    cover.src = data.photoUrl || "";
    cover.alt = data.name || "";

    const platforms = data.platforms || {};
    const rows = AW_PLATFORMS.filter((p) => platforms[p.key] && platforms[p.key].enabled && platforms[p.key].url);

    if (!rows.length) {
      empty.hidden = false;
      return;
    }

    list.innerHTML = rows
      .map(
        (p) => `
      <div class="smartlink-row">
        <span class="sl-icon" style="background:${p.color}">${p.icon}</span>
        <span class="sl-name">${escapeHtml(p.label)}</span>
        <a class="sl-btn" href="${escapeAttr(platforms[p.key].url)}" target="_blank" rel="noopener">${p.action}</a>
      </div>`
      )
      .join("");
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function escapeAttr(str) {
    return escapeHtml(str);
  }
})();
