/* Amberwave i18n
   - Auto-detects language from visitor IP on first visit (works with VPNs too,
     since it just reads whatever IP is currently making the request).
   - Remembers a manual choice in localStorage forever after that.
   - Supported: en (default/fallback), pt, es, fr.
*/
(function () {
  const SUPPORTED = ["en", "pt", "es", "fr"];
  const DEFAULT_LANG = "en";
  const STORAGE_KEY = "aw_lang";
  const STORAGE_SOURCE_KEY = "aw_lang_source"; // "auto" | "manual"

  const COUNTRY_TO_LANG = {
    // Portuguese
    PT: "pt", BR: "pt", AO: "pt", MZ: "pt", CV: "pt", GW: "pt", ST: "pt", TL: "pt",
    // Spanish
    ES: "es", MX: "es", AR: "es", CO: "es", CL: "es", PE: "es", VE: "es", EC: "es",
    GT: "es", CU: "es", BO: "es", DO: "es", HN: "es", PY: "es", SV: "es", NI: "es",
    CR: "es", PA: "es", UY: "es", GQ: "es",
    // French
    FR: "fr", BE: "fr", CH: "fr", CA: "fr", SN: "fr", CI: "fr", CM: "fr", CD: "fr",
    ML: "fr", NE: "fr", BF: "fr", TG: "fr", BJ: "fr", GA: "fr", HT: "fr", LU: "fr",
    MC: "fr", MG: "fr"
  };

  const cache = {};

  function langPath(lang) {
    return "js/lang/" + lang + ".json";
  }

  async function loadLang(lang) {
    if (cache[lang]) return cache[lang];
    const res = await fetch(langPath(lang));
    if (!res.ok) throw new Error("Failed to load " + lang);
    const data = await res.json();
    cache[lang] = data;
    return data;
  }

  function getByPath(obj, path) {
    return path.split(".").reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
  }

  async function detectLangFromIP() {
    try {
      const res = await fetch("https://ipapi.co/json/");
      if (!res.ok) throw new Error("geo lookup failed");
      const data = await res.json();
      const code = (data.country || data.country_code || "").toUpperCase();
      return COUNTRY_TO_LANG[code] || DEFAULT_LANG;
    } catch (e) {
      return DEFAULT_LANG;
    }
  }

  async function resolveInitialLang() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const source = localStorage.getItem(STORAGE_SOURCE_KEY);
    // A manual choice always wins, forever.
    if (saved && source === "manual" && SUPPORTED.includes(saved)) {
      return saved;
    }
    // Otherwise re-detect from current IP every visit (so a VPN change
    // updates the language automatically) unless already detected this session.
    const lang = await detectLangFromIP();
    localStorage.setItem(STORAGE_KEY, lang);
    localStorage.setItem(STORAGE_SOURCE_KEY, "auto");
    return lang;
  }

  function applyTranslations(dict, fallbackDict) {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const val = getByPath(dict, key) ?? getByPath(fallbackDict, key);
      if (val !== undefined) el.textContent = val;
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      const val = getByPath(dict, key) ?? getByPath(fallbackDict, key);
      if (val !== undefined) el.innerHTML = val;
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      const val = getByPath(dict, key) ?? getByPath(fallbackDict, key);
      if (val !== undefined) el.setAttribute("placeholder", val);
    });
    document.documentElement.setAttribute("lang", currentLang);
  }

  function buildSwitcher(dict) {
    const nav = document.querySelector(".site-nav .wrap");
    if (!nav || document.getElementById("langSwitch")) return;

    const names = { en: "EN", pt: "PT", es: "ES", fr: "FR" };
    const wrap = document.createElement("div");
    wrap.className = "lang-switch";
    wrap.id = "langSwitch";

    const select = document.createElement("select");
    select.setAttribute("aria-label", getByPath(dict, "langSwitcher.label") || "Language");
    SUPPORTED.forEach((code) => {
      const opt = document.createElement("option");
      opt.value = code;
      opt.textContent = names[code];
      if (code === currentLang) opt.selected = true;
      select.appendChild(opt);
    });

    select.addEventListener("change", async (e) => {
      const lang = e.target.value;
      localStorage.setItem(STORAGE_KEY, lang);
      localStorage.setItem(STORAGE_SOURCE_KEY, "manual");
      await setLang(lang);
    });

    wrap.appendChild(select);
    nav.insertBefore(wrap, nav.querySelector(".nav-toggle"));
  }

  let currentLang = DEFAULT_LANG;

  async function setLang(lang) {
    if (!SUPPORTED.includes(lang)) lang = DEFAULT_LANG;
    currentLang = lang;
    const [dict, fallback] = await Promise.all([
      loadLang(lang),
      lang === DEFAULT_LANG ? Promise.resolve(null) : loadLang(DEFAULT_LANG)
    ]);
    applyTranslations(dict, fallback || dict);
    buildSwitcher(dict);
    const select = document.querySelector("#langSwitch select");
    if (select) select.value = lang;
  }

  window.awI18n = { setLang, get currentLang() { return currentLang; } };

  document.addEventListener("DOMContentLoaded", async () => {
    const lang = await resolveInitialLang();
    await setLang(lang);
  });
})();
