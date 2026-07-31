(function () {
  const form = document.getElementById("applyForm");
  const msg = document.getElementById("formMsg");
  const submitBtn = document.getElementById("submitBtn");
  const successState = document.getElementById("successState");
  const uploadProgress = document.getElementById("uploadProgress");
  if (!form) return;

  function showMsg(text, type) {
    msg.textContent = text;
    msg.className = "form-msg show " + type;
  }

  /* ---------- live preview for the two upload boxes ---------- */
  function wirePreview(inputId, boxId, previewId) {
    const input = document.getElementById(inputId);
    const box = document.getElementById(boxId);
    const preview = document.getElementById(previewId);
    input.addEventListener("change", () => {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.src = e.target.result;
        box.classList.add("has-file");
      };
      reader.readAsDataURL(file);
    });
  }
  wirePreview("idPhoto", "idBox", "idPreview");
  wirePreview("selfieWithId", "selfieBox", "selfiePreview");

  /* ---------- upload one file to Cloudinary, resolve with secure_url ---------- */
  function uploadToCloudinary(file) {
    if (
      typeof cloudinaryConfig === "undefined" ||
      cloudinaryConfig.cloudName === "YOUR_CLOUD_NAME"
    ) {
      return Promise.reject(new Error("Cloudinary isn't configured yet — see js/cloudinary-config.js"));
    }
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", cloudinaryConfig.uploadPreset);
    if (cloudinaryConfig.folder) data.append("folder", cloudinaryConfig.folder);

    return fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`, {
      method: "POST",
      body: data
    })
      .then((res) => {
        if (!res.ok) throw new Error("Upload failed");
        return res.json();
      })
      .then((json) => json.secure_url);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (typeof db === "undefined") {
      showMsg("This form can't submit yet — Firebase isn't configured. See js/firebase-config.js.", "err");
      return;
    }

    const idFile = document.getElementById("idPhoto").files[0];
    const selfieFile = document.getElementById("selfieWithId").files[0];
    if (!idFile || !selfieFile) {
      showMsg("Please add both a photo of your ID and a photo of you holding it.", "err");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Uploading…";
    uploadProgress.classList.add("show");
    msg.classList.remove("show");

    Promise.all([uploadToCloudinary(idFile), uploadToCloudinary(selfieFile)])
      .then(([idPhotoUrl, selfieWithIdUrl]) => {
        submitBtn.textContent = "Sending…";
        const data = {
          fullName: form.fullName.value.trim(),
          stageName: form.stageName.value.trim(),
          platform: form.platform.value,
          genre: form.genre.value.trim(),
          profileLink: form.profileLink.value.trim(),
          email: form.email.value.trim(),
          phone: form.phone.value.trim(),
          message: form.message.value.trim(),
          idPhotoUrl: idPhotoUrl,
          selfieWithIdUrl: selfieWithIdUrl,
          status: "new",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        return db.collection("applications").add(data);
      })
      .then(() => {
        form.style.display = "none";
        msg.classList.remove("show");
        uploadProgress.classList.remove("show");
        successState.style.display = "block";
      })
      .catch((err) => {
        console.error(err);
        showMsg(err.message || "Something went wrong sending your application. Please try again.", "err");
        uploadProgress.classList.remove("show");
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit application";
      });
  });
})();
