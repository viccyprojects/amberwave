/* =========================================================
   AMBERWAVE — Admin dashboard
   Requires Firebase Auth (email/password) + Firestore, configured
   in ../js/firebase-config.js. Create your admin user in the
   Firebase console under Authentication → Users.
   ========================================================= */

const loginScreen = document.getElementById("loginScreen");
const dashboard = document.getElementById("dashboard");
const loginForm = document.getElementById("loginForm");
const loginMsg = document.getElementById("loginMsg");

function showLoginError(text) {
  loginMsg.textContent = text;
  loginMsg.className = "form-msg show err";
}

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  auth.signInWithEmailAndPassword(email, password).catch((err) => {
    showLoginError(err.message || "Login failed.");
  });
});

document.getElementById("logoutBtn").addEventListener("click", () => auth.signOut());

auth.onAuthStateChanged((user) => {
  if (user) {
    loginScreen.hidden = true;
    dashboard.hidden = false;
    loadApplications();
    loadMessages();
    loadSiteContent();
  } else {
    loginScreen.hidden = false;
    dashboard.hidden = true;
  }
});

/* ---------- Tabs ---------- */
document.querySelectorAll(".tab-btn[data-tab]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn[data-tab]").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((p) => (p.hidden = true));
    btn.classList.add("active");
    document.getElementById("tab-" + btn.dataset.tab).hidden = false;
  });
});

function fmtDate(ts) {
  if (!ts || !ts.toDate) return "—";
  return ts.toDate().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

/* ---------- Applications ---------- */
function loadApplications() {
  db.collection("applications")
    .orderBy("createdAt", "desc")
    .onSnapshot((snap) => {
      const rows = document.getElementById("appRows");
      const empty = document.getElementById("appEmpty");
      document.getElementById("appCount").textContent = snap.size + " total";
      rows.innerHTML = "";
      empty.hidden = snap.size !== 0;

      snap.forEach((doc) => {
        const d = doc.data();
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${escapeHtml(d.fullName || "")}${d.stageName ? " <span style='color:var(--mute-dim)'>(" + escapeHtml(d.stageName) + ")</span>" : ""}</td>
          <td>${escapeHtml(d.platform || "")}</td>
          <td>${escapeHtml(d.genre || "")}</td>
          <td><a href="${escapeAttr(d.profileLink || "#")}" target="_blank" rel="noopener">View</a></td>
          <td>
            ${d.idPhotoUrl ? `<a href="${escapeAttr(d.idPhotoUrl)}" target="_blank" rel="noopener">ID</a>` : "<span style='color:var(--mute-dim)'>—</span>"}
            &nbsp;/&nbsp;
            ${d.selfieWithIdUrl ? `<a href="${escapeAttr(d.selfieWithIdUrl)}" target="_blank" rel="noopener">Selfie</a>` : "<span style='color:var(--mute-dim)'>—</span>"}
          </td>
          <td>
            <select class="status-select" data-id="${doc.id}" data-coll="applications">
              ${["new", "reviewing", "accepted", "declined"]
                .map((s) => `<option value="${s}" ${d.status === s ? "selected" : ""}>${s}</option>`)
                .join("")}
            </select>
          </td>
          <td>${fmtDate(d.createdAt)}</td>
          <td><button class="row-delete" data-id="${doc.id}" data-coll="applications">Delete</button></td>
        `;
        rows.appendChild(tr);
      });
      bindRowActions();
    });
}

/* ---------- Messages ---------- */
function loadMessages() {
  db.collection("messages")
    .orderBy("createdAt", "desc")
    .onSnapshot((snap) => {
      const rows = document.getElementById("msgRows");
      const empty = document.getElementById("msgEmpty");
      document.getElementById("msgCount").textContent = snap.size + " total";
      rows.innerHTML = "";
      empty.hidden = snap.size !== 0;

      snap.forEach((doc) => {
        const d = doc.data();
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${escapeHtml(d.name || "")}</td>
          <td>${escapeHtml(d.subject || "")}<br><span style="color:var(--mute-dim);font-size:12px;">${escapeHtml(d.message || "").slice(0, 60)}${(d.message || "").length > 60 ? "…" : ""}</span></td>
          <td><a href="mailto:${escapeAttr(d.email || "")}">${escapeHtml(d.email || "")}</a></td>
          <td>${fmtDate(d.createdAt)}</td>
          <td><button class="row-delete" data-id="${doc.id}" data-coll="messages">Delete</button></td>
        `;
        rows.appendChild(tr);
      });
      bindRowActions();
    });
}

function bindRowActions() {
  document.querySelectorAll(".status-select").forEach((sel) => {
    sel.onchange = () => {
      db.collection(sel.dataset.coll).doc(sel.dataset.id).update({ status: sel.value });
    };
  });
  document.querySelectorAll(".row-delete").forEach((btn) => {
    btn.onclick = () => {
      if (confirm("Delete this entry? This can't be undone.")) {
        db.collection(btn.dataset.coll).doc(btn.dataset.id).delete();
      }
    };
  });
}

/* ---------- Site content (stats bar) ---------- */
const STAT_DEFS = [
  { key: "scoutedCount", label: "Streams scouted & analyzed", placeholder: "2,000,000+" },
  { key: "artistsCount", label: "Unsigned artists reviewed", placeholder: "4,800+" },
  { key: "countriesCount", label: "Countries represented", placeholder: "30+" },
  { key: "signedCount", label: "Artists signed to Amberwave Records", placeholder: "120+" }
];

function loadSiteContent() {
  const container = document.getElementById("statFields");
  container.innerHTML = STAT_DEFS.map(
    (s) => `
    <div class="stat-row">
      <label for="stat-${s.key}">${s.label}</label>
      <input type="text" id="stat-${s.key}" placeholder="${s.placeholder}" />
      <label class="visibility">
        <input type="checkbox" id="vis-${s.key}" checked /> Show on site
      </label>
    </div>`
  ).join("");

  db.collection("siteConfig")
    .doc("home")
    .get()
    .then((doc) => {
      if (!doc.exists) return;
      const data = doc.data();
      STAT_DEFS.forEach((s) => {
        if (data[s.key]) document.getElementById("stat-" + s.key).value = data[s.key];
        if (data[s.key + "Visible"] === false) document.getElementById("vis-" + s.key).checked = false;
      });
    });
}

document.getElementById("saveContentBtn").addEventListener("click", () => {
  const payload = {};
  STAT_DEFS.forEach((s) => {
    const val = document.getElementById("stat-" + s.key).value.trim();
    if (val) payload[s.key] = val;
    payload[s.key + "Visible"] = document.getElementById("vis-" + s.key).checked;
  });
  db.collection("siteConfig")
    .doc("home")
    .set(payload, { merge: true })
    .then(() => {
      const el = document.getElementById("contentSaved");
      el.textContent = "Saved — changes are live on the home page.";
      el.className = "form-msg show ok";
      setTimeout(() => el.classList.remove("show"), 2500);
    });
});

/* ---------- helpers ---------- */
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function escapeAttr(str) {
  return escapeHtml(str);
}
