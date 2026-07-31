# Amberwave — Artist Scouting & Record Label Site

A multi-page marketing + application site:

- `index.html` — home (hero, live stats, services, process, testimonials, CTA)
- `artists.html` — public artist roster grid
- `artist.html?slug=...` — per-artist smart-link page (choose your platform)
- `about.html` — about / philosophy
- `apply.html` — record label application form (name, platform, profile link, genre, contact, pitch)
- `contact.html` — general inquiries form + FAQ + admin-editable contact info
- **`admin/`** ships as a separate zip — see §5 and §7

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

## 5. The admin panel is now a fully separate bundle

`admin/` is no longer part of the public site's zip at all — it ships as its own
separate zip (`amberwave-admin.zip`, see §7) so you can deploy it to a completely
different URL that the public site's code never mentions. It's still gated by
Firebase email/password login, so only the account you create in step 1.4
(`viccylay30@gmail.com`) can get in. From it you can:

- View, update the status of, and delete **applications**
- View and delete **contact messages**
- Edit or hide the home page stats
- Add/edit/delete **artists** and their platform links (§9)
- Edit the **contact info** strip shown on the contact page (§10)

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

## 7. Deploying — public site and admin are now two separate bundles

The admin dashboard is no longer shipped inside the public site's folder — it's a
**separate zip** so you can host it somewhere the public site never links to or
reveals (a different subdomain, a different host entirely, IP-restricted, etc.).
Both bundles talk to the *same* Firebase project, so nothing needs to be duplicated
in Firestore — you're just splitting where the files live.

- **`amberwave-site.zip`** — the public site (`index.html`, `artists.html`,
  `artist.html`, `about.html`, `apply.html`, `contact.html`, `css/`, `js/`,
  `images/`). Deploy this to Vercel/GitHub Pages/Netlify like normal.
- **`amberwave-admin.zip`** — the admin dashboard, fully self-contained (its own
  copy of `css/style.css`, `js/firebase-config.js`, `js/cloudinary-config.js`,
  `js/platforms.js`, `images/logo-mark.svg`). Deploy this separately — a different
  Vercel project, a different subdomain, whatever you'd like — so its URL is never
  referenced anywhere in the public site's HTML/JS.

Whichever host you use for the admin bundle, it's still gated by Firebase
email/password login underneath, so treat the separate URL as an extra layer, not
a replacement for that login.

**Your admin login:** create a user in **Firebase console → Authentication → Users**
with email `viccylay30@gmail.com` and a password of your choosing — that's the only
account able to log into the dashboard.

## 8. Customizing

- **Colors / fonts**: all in `css/style.css` under the `:root` variables at the top.
  The site now uses a true near-black (`--ink: #0a0a0c`) instead of the earlier
  indigo-plum tone.
- **Logo**: `images/logo-mark.svg` — a simple amber-to-signal gradient waveform
  mark. Swap the file for your own artwork any time; every page references it by
  the same filename so nothing else needs to change.
- **Copy**: edit directly in the HTML files (or via `js/lang/*.json` for the
  translated versions — see the i18n notes below).
- **Photos**: the design currently uses generated gradients, an animated canvas
  "signal line" (audio-waveform motif), and SVG icons instead of stock photos, so
  there's nothing to license. Swap in real artist/studio photography any time by
  adding `<img>` tags inside `.hero-visual` or `.figure` elements.

## 9. Artists roster + artist smart-link pages

Two new public pages:

- **`artists.html`** — a grid of every visible artist (photo + name overlay, like a
  typical label roster page), reading from the `artists` Firestore collection.
- **`artist.html?slug=...`** — a per-artist "smart link" page (the choose-your-platform
  style page, e.g. `cupidszn.lnk.to`) listing only the platforms the admin enabled
  for that artist, each with its logo and a Play/Join/Follow button linking straight
  out to that artist's page on that platform.

Manage all of this from **`/admin` → Artists tab**: add a name and photo, set a
display order, toggle visibility, and for each platform (Spotify, Apple Music,
YouTube, YouTube Music, Audiomack, Boomplay, TikTok, SoundCloud, mailing list) tick
it on and paste the artist's URL for that platform — anything left unticked or
blank just won't show on their page. New platforms can be added for everyone by
editing the `AW_PLATFORMS` list in `js/platforms.js`.

Artist photos upload through the same Cloudinary setup as the ID-verification
photos (see §6) — just make sure your unsigned upload preset allows the
`amberwave/artists` folder, or leave folder restrictions off in the preset.

## 10. Contact page info block

`contact.html` now shows an optional "Email / Phone / Address / Hours" strip above
the contact form, editable from **`/admin` → Contact info** tab (`siteConfig/contact`
in Firestore). Leave any field blank in the admin panel and that item just doesn't
render — nothing shows until you fill something in.

## 11. Updated Firestore rules

Add these two blocks alongside the ones in §3 so the new collections work the same
way (public read, admin-only write):

```
match /artists/{doc} {
  allow read: if true;
  allow write: if request.auth != null;
}
```

(`siteConfig/{doc}` already covers the new `contact` document from §10 — no change
needed there.)

## 12. Multi-language (EN / PT / ES / FR)

The four main pages auto-detect a visitor's language from their IP on first visit
(so it also follows a VPN's exit country) and remember any manual choice from the
language switcher in the nav, forever, in `localStorage`. Translations live in
`js/lang/en.json` (also the fallback), `pt.json`, `es.json`, `fr.json` — edit those
directly to change copy in a given language. `artists.html` and `artist.html` are
tagged for translation too, but artist names/bios themselves aren't translated
(they come straight from what the admin enters).
