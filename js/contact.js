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
