(function () {
  const form = document.getElementById("contactForm");
  const msg = document.getElementById("contactMsg");
  const btn = document.getElementById("contactSubmitBtn");
  if (!form) return;

  function showMsg(text, type) {
    msg.textContent = text;
    msg.className = "form-msg show " + type;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (typeof db === "undefined") {
      showMsg("This form can't submit yet — Firebase isn't configured.", "err");
      return;
    }

    const data = {
      name: form.cName.value.trim(),
      email: form.cEmail.value.trim(),
      subject: form.cSubject.value,
      message: form.cMessage.value.trim(),
      status: "unread",
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    btn.disabled = true;
    btn.textContent = "Sending…";

    db.collection("messages")
      .add(data)
      .then(() => {
        showMsg("Message sent — we'll get back to you by email.", "ok");
        form.reset();
        btn.disabled = false;
        btn.textContent = "Send message";
      })
      .catch((err) => {
        console.error(err);
        showMsg("Something went wrong. Please try again.", "err");
        btn.disabled = false;
        btn.textContent = "Send message";
      });
  });
})();

/* ---------- Contact info block (admin-editable, siteConfig/contact) ---------- */
(function () {
  const block = document.getElementById("contactInfoBlock");
  if (!block || typeof db === "undefined") return;

  db.collection("siteConfig")
    .doc("contact")
    .get()
    .then((doc) => {
      if (!doc.exists) return;
      const d = doc.data();
      const items = [];
      if (d.email) items.push({ labelKey: "contact.infoEmailLabel", fallback: "Email", html: `<a href="mailto:${escapeAttr(d.email)}">${escapeHtml(d.email)}</a>` });
      if (d.phone) items.push({ labelKey: "contact.infoPhoneLabel", fallback: "Phone", html: `<a href="tel:${escapeAttr(d.phone)}">${escapeHtml(d.phone)}</a>` });
      if (d.address) items.push({ labelKey: "contact.infoAddressLabel", fallback: "Address", html: `<p>${escapeHtml(d.address)}</p>` });
      if (d.hours) items.push({ labelKey: "contact.infoHoursLabel", fallback: "Hours", html: `<p>${escapeHtml(d.hours)}</p>` });
      if (!items.length) return;

      block.innerHTML = items
        .map(
          (i) => `
        <div class="contact-info-item">
          <h5 data-i18n="${i.labelKey}">${i.fallback}</h5>
          ${i.html}
        </div>`
        )
        .join("");
      block.hidden = false;
      if (window.awI18n) window.awI18n.setLang(window.awI18n.currentLang);
    })
    .catch(() => {});

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function escapeAttr(str) {
    return escapeHtml(str);
  }
})();
