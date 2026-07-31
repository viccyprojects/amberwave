# Amberwave — Artist Scouting & Record Label Site

A multi-page marketing + application site:

- `index.html` — home (hero, live stats, services, process, testimonials, CTA)
- `about.html` — about / philosophy
- `apply.html` — record label application form (name, platform, profile link, genre, contact, pitch)
- `contact.html` — general inquiries form + FAQ
- `admin/index.html` — **private admin dashboard** (not linked anywhere on the public site)

## 1. Create a Firebase project

1. Go to https://console.firebase.google.com → **Add project** (give it its own project — don't reuse another app's project, to keep this data separate).
2. In the project, go to **Build → Firestore Database → Create database** (start in production mode).
3. Go to **Build → Authentication → Sign-in method** → enable **Email/Password**.
4. Go to **Build → Authentication → Users → Add user** and create yourself an admin login (this is the *only* account that should be able to log into `/admin`).
5. Go to **Project settings → General → Your apps → Web app (</> icon)**, register the app, and copy the `firebaseConfig` object.

## 2. Paste your config

Open `js/firebase-config.js` and replace the placeholder values with the config you copied:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

That one file is shared by every page, including `/admin`.

## 3. Firestore security rules

In **Firestore → Rules**, use something like this — it lets the public forms *create* documents, but only your logged-in admin account can read/update/delete anything:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /applications/{doc} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }

    match /messages/{doc} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }

    match /siteConfig/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 4. The removable "2,000,000+ scouted" stat

The home page stats bar has four numbers, each wired to a Firestore field under
`siteConfig/home`: `scoutedCount`, `artistsCount`, `countriesCount`, `signedCount`
(plus a matching `...Visible` boolean for each).

- If Firebase isn't set up yet, the page just shows the hardcoded placeholder numbers in the HTML — nothing breaks.
- Once Firebase is connected, log into `/admin` → **Site content** tab to edit any number, or untick **Show on site** to remove that stat (e.g. the "2,000,000+ scouted" figure) from the live page entirely, any time — including after your testing period.

## 5. The admin panel is intentionally separate

`admin/index.html` is never linked from the public nav or footer — it only exists
if someone types the URL directly (e.g. `yourdomain.com/admin/`). It's gated by
Firebase email/password login, so only the account you create in step 1.4 can get in.
From it you can:

- View, update the status of, and delete **applications**
- View and delete **contact messages**
- Edit or hide the home page stats

For extra privacy you can also rename the `admin` folder to something less guessable
(e.g. `admin-9f2k`) before deploying — just make sure the `../css/style.css` and
`../js/firebase-config.js` relative paths still resolve.

## 6. ID verification photos (Cloudinary)

The apply form now asks for two photos before it can submit: one of the applicant's
ID, and one of the applicant holding that ID next to their face. This is a common,
lightweight anti-spam check — it doesn't verify identity legally, it just makes
throwaway/bot submissions much less likely.

**What to set up in Cloudinary** (https://cloudinary.com — free tier is enough to start):

1. Log in and note your **Cloud name** — it's shown top-left on the dashboard.
2. Go to **Settings (gear icon) → Upload → Upload presets → Add upload preset**.
3. Set:
   - **Signing Mode: Unsigned** (required — the form uploads directly from the browser, with no server)
   - **Folder**: `amberwave/verification` (or whatever you'd like — keeps these separate from any other Cloudinary uploads on your account)
   - **Allowed formats**: `jpg, png, heic, webp`
   - Optional but recommended: turn on **Eager transformations** to auto-resize large phone photos (e.g. `c_limit,w_1600`), so you're not storing full-resolution originals.
4. Save the preset and copy its **name**.
5. Open `js/cloudinary-config.js` and fill in:
   ```js
   const cloudinaryConfig = {
     cloudName: "your-cloud-name",
     uploadPreset: "your-preset-name",
     folder: "amberwave/verification"
   };
   ```

That's the only file that needs your Cloudinary details — `apply.js` already handles
uploading both photos and attaching their URLs (`idPhotoUrl`, `selfieWithIdUrl`) to
the application record in Firestore. In `/admin`, each application row gets **ID** /
**Selfie** links that open the two photos in a new tab.

**Important limitations to know about:**

- Because this is an *unsigned* preset (no backend server), the resulting image
  URLs are technically reachable by anyone who has the exact link — Cloudinary
  doesn't have a way to make unsigned uploads truly private without a server-side
  signing step. In practice this is fine for a low-stakes spam filter, but don't
  treat it as a secure vault for sensitive documents. The Firestore `applications`
  collection itself is already locked down to your admin login only, so the links
  aren't publicly listed anywhere — just not cryptographically private.
- You're collecting government ID images, which is sensitive personal data in most
  places (Nigeria's NDPR, GDPR if you get EU applicants, etc.). Before this goes
  live it's worth adding a short privacy notice near the upload boxes explaining
  why you need it, how long you'll keep it, and that applicants can request
  deletion — and deciding on an actual deletion schedule (e.g. auto-delete
  rejected applicants' photos after 30 days). I'm not a lawyer, so treat this as a
  prompt to check what's required for your situation, not legal advice.
- The consent checkbox on the form is a reasonable baseline, not a substitute for
  that privacy notice.

## 7. Deploying

This is a static site (no build step) — it works as-is on Vercel, Netlify, Firebase
Hosting, or any static host. Just upload the whole folder, keeping the `css/`, `js/`,
and `admin/` folders alongside the HTML files.

## 8. Customizing

- **Colors / fonts**: all in `css/style.css` under the `:root` variables at the top.
- **Copy**: edit directly in the HTML files.
- **Photos**: the design currently uses generated gradients, an animated canvas
  "signal line" (audio-waveform motif), and SVG icons instead of stock photos, so
  there's nothing to license. Swap in real artist/studio photography any time by
  adding `<img>` tags inside `.hero-visual` or `.figure` elements.
