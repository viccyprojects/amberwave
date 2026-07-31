/* =========================================================
   AMBERWAVE — public artist roster grid (artists.html)
   Reads the "artists" Firestore collection. Only artists with
   visible !== false show up, ordered by "order" then name.
   ========================================================= */
(function () {
  const grid = document.getElementById("artistGrid");
  const empty = document.getElementById("artistGridEmpty");
  if (!grid || typeof db === "undefined") return;

  db.collection("artists")
    .orderBy("order", "asc")
    .get()
    .then(renderArtists)
    .catch(() => {
      // Fallback if "order" field / index isn't set up yet
      db.collection("artists").get().then(renderArtists).catch(() => {
        empty.hidden = false;
      });
    });

  function renderArtists(snap) {
    const artists = [];
    snap.forEach((doc) => {
      const d = doc.data();
      if (d.visible === false) return;
      artists.push({ id: doc.id, ...d });
    });

    if (!artists.length) {
      empty.hidden = false;
      return;
    }

    grid.innerHTML = artists
      .map(
        (a) => `
      <a class="artist-card" href="artist.html?slug=${encodeURIComponent(a.slug || a.id)}">
        <img src="${escapeAttr(a.photoUrl || "")}" alt="${escapeAttr(a.name || "")}" loading="lazy" />
        <span class="artist-name">${escapeHtml(a.name || "")}</span>
      </a>`
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
