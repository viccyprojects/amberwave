/* =========================================================
   AMBERWAVE — supported platform definitions
   Each has a brand colour + simple inline icon, used on the
   artist smart-link page (public) and the Artists admin form.
   Add new ones here and they show up in both places.
   ========================================================= */
const AW_PLATFORMS = [
  {
    key: "spotify",
    label: "Spotify",
    color: "#1ED760",
    action: "Play",
    icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="#0a0a0c"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.59 14.4a.62.62 0 0 1-.86.2c-2.35-1.44-5.3-1.76-8.79-.96a.62.62 0 1 1-.27-1.21c3.82-.87 7.1-.5 9.72 1.1.3.19.4.58.2.87zm1.22-2.72a.78.78 0 0 1-1.07.26c-2.69-1.65-6.79-2.13-9.97-1.17a.78.78 0 1 1-.45-1.49c3.64-1.1 8.16-.57 11.24 1.32.37.23.48.71.25 1.08zm.11-2.83C14.98 9.03 9.08 8.84 5.7 9.86a.93.93 0 1 1-.54-1.78c3.88-1.18 10.37-.95 14.46 1.48a.93.93 0 0 1-.95 1.6z"/></svg>'
  },
  {
    key: "appleMusic",
    label: "Apple Music",
    color: "#FA243C",
    action: "Play",
    icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="#ffffff"><path d="M17.5 3c.3.9.4 1.9.2 2.9-.9-.1-1.9-.6-2.5-1.3-.6-.6-1-1.6-.9-2.5.9 0 1.9.5 2.5 1.3zM19.9 16c-.1.3-.5 1.2-1.1 2-.5.8-1.1 1.6-1.9 1.6-.8 0-1-.5-1.9-.5s-1.2.5-1.9.5c-.8 0-1.4-.8-1.9-1.6-1.1-1.6-2-4.5-.8-6.5.6-1 1.6-1.6 2.7-1.6.8 0 1.5.5 1.9.5.4 0 1.3-.6 2.2-.5.4 0 1.5.1 2.2 1.2-.1 0-1.3.8-1.3 2.3 0 1.8 1.6 2.4 1.6 2.4zM9.5 8h-1V19h1V8zm-2.3.9c-.3 0-.6.2-.6.6v8c0 .3.3.6.6.6s.6-.3.6-.6v-8c0-.4-.3-.6-.6-.6zm-2.1.9c-.3 0-.5.2-.5.5v6.2c0 .3.2.5.5.5s.5-.2.5-.5V10.3c0-.3-.2-.5-.5-.5z"/></svg>'
  },
  {
    key: "youtube",
    label: "YouTube",
    color: "#FF0000",
    action: "Play",
    icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="#ffffff"><path d="M9.6 15.6V8.4l6.4 3.6-6.4 3.6z"/></svg>'
  },
  {
    key: "youtubeMusic",
    label: "YouTube Music",
    color: "#FF0000",
    action: "Play",
    icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="#ffffff"><circle cx="12" cy="12" r="9" fill="none" stroke="#ffffff" stroke-width="1.6"/><circle cx="12" cy="12" r="3" fill="none" stroke="#ffffff" stroke-width="1.6"/><path d="M12 10.5l2 1.5-2 1.5v-3z" fill="#ffffff"/></svg>'
  },
  {
    key: "audiomack",
    label: "Audiomack",
    color: "#FFA200",
    action: "Play",
    icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#0a0a0c" stroke-width="1.8" stroke-linecap="round"><path d="M3 12h2l2-5 3 10 3-14 3 12 2-5h3"/></svg>'
  },
  {
    key: "boomplay",
    label: "Boomplay",
    color: "#EC1466",
    action: "Play",
    icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="#ffffff"><circle cx="12" cy="12" r="9"/><path d="M10 8.5l6 3.5-6 3.5v-7z" fill="#EC1466"/></svg>'
  },
  {
    key: "tiktok",
    label: "TikTok",
    color: "#111111",
    action: "Follow",
    icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="#ffffff"><path d="M16.5 3c.4 2.2 1.9 3.7 4 3.9v2.6c-1.4 0-2.7-.4-3.9-1.2v6.2c0 3-2.4 5.5-5.5 5.5S5.6 17.5 5.6 14.5s2.4-5.5 5.5-5.5c.4 0 .8 0 1.2.1v2.7c-.4-.1-.8-.2-1.2-.2-1.6 0-2.9 1.3-2.9 2.9s1.3 2.9 2.9 2.9 2.9-1.3 2.9-2.9V3h2.5z"/></svg>'
  },
  {
    key: "soundcloud",
    label: "SoundCloud",
    color: "#FF5500",
    action: "Play",
    icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="#ffffff"><path d="M4 12v4h1v-4H4zm2-2v6h1v-6H6zm2-1v7h1V9H8zm2-1v8h1V8h-1zm2 1v7h1V9h-1zm2-2v9h5.5a3 3 0 0 0 0-6 4 4 0 0 0-7.5-1.3V7h-1v9h1V7z"/></svg>'
  },
  {
    key: "mailingList",
    label: "Join mailing list",
    color: "#f6f1ea",
    action: "Join",
    icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#0a0a0c" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  }
];

function awGetPlatform(key) {
  return AW_PLATFORMS.find((p) => p.key === key);
}
