(function () {
  const section = document.getElementById("homeArtists");
  const grid = document.getElementById("homeArtistGrid");
  if (!section || !grid || typeof db === "undefined") return;

  db.collection("artists")
    .orderBy("order", "asc")
    .get()
    .then(render)
    .catch(() => {
      db.collection("artists").get().then(render).catch(() => {});
    });

  function render(snap) {
    const artists = [];
    snap.forEach((doc) => {
      const d = doc.data();
      if (d.visible === false) return;
      artists.push({ id: doc.id, ...d });
    });
    if (!artists.length) return; // section stays hidden

    grid.innerHTML = artists
      .map((a) => {
        const large = a.layout === "large" ? " is-large" : "";
        return `
        <a class="home-artist-card${large}" href="artist.html?slug=${encodeURIComponent(a.slug || a.id)}">
          <img src="${escapeAttr(a.photoUrl || "")}" alt="${escapeAttr(a.name || "")}" loading="lazy" />
          <span class="han">${escapeHtml(a.name || "")}</span>
        </a>`;
      })
      .join("");

    section.hidden = false;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function escapeAttr(str) {
    return escapeHtml(str);
  }
})();
