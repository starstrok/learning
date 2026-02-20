/* =========================================================
   HappyNews — app.js
   Fetches positive world news from The Guardian API,
   filters out negative/political content, and renders a
   Google News-style layout plus an interactive Leaflet map.
   ========================================================= */

// ─── Configuration ──────────────────────────────────────────
const CFG = {
  BASE_URL: 'https://content.guardianapis.com/search',
  get API_KEY() { return localStorage.getItem('guardian_api_key') || 'test'; },

  // Guardian sections that tend to carry positive stories
  HAPPY_SECTIONS: [
    'science', 'technology', 'culture', 'sport', 'travel',
    'food', 'music', 'film', 'books', 'lifeandstyle',
    'environment', 'artanddesign', 'stage', 'education',
  ],

  // Negative/political keywords — articles whose titles contain
  // any of these (whole word) are excluded.
  BLOCKLIST: [
    'trump', 'maga', 'putin', 'xi jinping', 'regime', 'dictator',
    'war', 'killed', 'kill', 'dead', 'death', 'deaths', 'murder',
    'shooting', 'stabbing', 'bomb', 'bombing', 'attack', 'terror',
    'terrorist', 'crime', 'criminal', 'arrest', 'prison', 'jail',
    'sentence', 'convicted', 'guilty', 'verdict', 'scandal',
    'corruption', 'impeach', 'resign', 'riot', 'clash', 'unrest',
    'crisis', 'disaster', 'flood', 'earthquake', 'hurricane',
    'wildfire', 'recession', 'inflation', 'layoff', 'unemploy',
    'pandemic', 'epidemic', 'outbreak', 'abuse', 'assault',
    'harassment', 'rape', 'lawsuit', 'sanction', 'tariff',
    'hamas', 'isis', 'taliban', 'overdose', 'suicide', 'violence',
    'hate crime', 'deportat', 'migrant crisis', 'hostage',
    'shooting', 'invasion', 'coup', 'massacre', 'genocide',
    'traffick', 'smuggl', 'bribery',
  ],

  // Cards to display per page
  PAGE_SIZE: 9,
};

// ─── Country lookup ──────────────────────────────────────────
// Maps Guardian tag/URL fragments → { name, lat, lng, flag }
const COUNTRIES = {
  // Europe
  'united-kingdom': { name: 'United Kingdom', lat: 55.38,  lng: -3.44,   flag: '🇬🇧' },
  'uk':             { name: 'United Kingdom', lat: 55.38,  lng: -3.44,   flag: '🇬🇧' },
  'england':        { name: 'England',        lat: 52.36,  lng: -1.17,   flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  'scotland':       { name: 'Scotland',       lat: 56.49,  lng: -4.20,   flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  'wales':          { name: 'Wales',          lat: 52.13,  lng: -3.78,   flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  'ireland':        { name: 'Ireland',        lat: 53.14,  lng: -7.69,   flag: '🇮🇪' },
  'france':         { name: 'France',         lat: 46.23,  lng: 2.21,    flag: '🇫🇷' },
  'germany':        { name: 'Germany',        lat: 51.17,  lng: 10.45,   flag: '🇩🇪' },
  'italy':          { name: 'Italy',          lat: 41.87,  lng: 12.57,   flag: '🇮🇹' },
  'spain':          { name: 'Spain',          lat: 40.46,  lng: -3.75,   flag: '🇪🇸' },
  'portugal':       { name: 'Portugal',       lat: 39.40,  lng: -8.22,   flag: '🇵🇹' },
  'netherlands':    { name: 'Netherlands',    lat: 52.13,  lng: 5.29,    flag: '🇳🇱' },
  'belgium':        { name: 'Belgium',        lat: 50.50,  lng: 4.47,    flag: '🇧🇪' },
  'switzerland':    { name: 'Switzerland',    lat: 46.82,  lng: 8.23,    flag: '🇨🇭' },
  'austria':        { name: 'Austria',        lat: 47.52,  lng: 14.55,   flag: '🇦🇹' },
  'sweden':         { name: 'Sweden',         lat: 60.13,  lng: 18.64,   flag: '🇸🇪' },
  'norway':         { name: 'Norway',         lat: 60.47,  lng: 8.47,    flag: '🇳🇴' },
  'denmark':        { name: 'Denmark',        lat: 56.26,  lng: 9.50,    flag: '🇩🇰' },
  'finland':        { name: 'Finland',        lat: 61.92,  lng: 25.75,   flag: '🇫🇮' },
  'iceland':        { name: 'Iceland',        lat: 64.96,  lng: -19.02,  flag: '🇮🇸' },
  'poland':         { name: 'Poland',         lat: 51.92,  lng: 19.15,   flag: '🇵🇱' },
  'czech':          { name: 'Czech Republic', lat: 49.82,  lng: 15.47,   flag: '🇨🇿' },
  'hungary':        { name: 'Hungary',        lat: 47.16,  lng: 19.50,   flag: '🇭🇺' },
  'romania':        { name: 'Romania',        lat: 45.94,  lng: 24.97,   flag: '🇷🇴' },
  'greece':         { name: 'Greece',         lat: 39.07,  lng: 21.82,   flag: '🇬🇷' },
  'croatia':        { name: 'Croatia',        lat: 45.10,  lng: 15.20,   flag: '🇭🇷' },
  // Americas
  'us-news':        { name: 'United States',  lat: 37.09,  lng: -95.71,  flag: '🇺🇸' },
  'us':             { name: 'United States',  lat: 37.09,  lng: -95.71,  flag: '🇺🇸' },
  'canada':         { name: 'Canada',         lat: 56.13,  lng: -106.35, flag: '🇨🇦' },
  'mexico':         { name: 'Mexico',         lat: 23.63,  lng: -102.55, flag: '🇲🇽' },
  'brazil':         { name: 'Brazil',         lat: -14.24, lng: -51.93,  flag: '🇧🇷' },
  'argentina':      { name: 'Argentina',      lat: -38.42, lng: -63.62,  flag: '🇦🇷' },
  'chile':          { name: 'Chile',          lat: -35.68, lng: -71.54,  flag: '🇨🇱' },
  'colombia':       { name: 'Colombia',       lat: 4.57,   lng: -74.30,  flag: '🇨🇴' },
  'peru':           { name: 'Peru',           lat: -9.19,  lng: -75.02,  flag: '🇵🇪' },
  'ecuador':        { name: 'Ecuador',        lat: -1.83,  lng: -78.18,  flag: '🇪🇨' },
  'bolivia':        { name: 'Bolivia',        lat: -16.29, lng: -63.59,  flag: '🇧🇴' },
  'costa-rica':     { name: 'Costa Rica',     lat: 9.75,   lng: -83.75,  flag: '🇨🇷' },
  'cuba':           { name: 'Cuba',           lat: 21.52,  lng: -77.78,  flag: '🇨🇺' },
  'jamaica':        { name: 'Jamaica',        lat: 18.11,  lng: -77.30,  flag: '🇯🇲' },
  // Asia-Pacific
  'australia':      { name: 'Australia',      lat: -25.27, lng: 133.78,  flag: '🇦🇺' },
  'new-zealand':    { name: 'New Zealand',    lat: -40.90, lng: 174.89,  flag: '🇳🇿' },
  'japan':          { name: 'Japan',          lat: 36.20,  lng: 138.25,  flag: '🇯🇵' },
  'south-korea':    { name: 'South Korea',    lat: 35.91,  lng: 127.77,  flag: '🇰🇷' },
  'china':          { name: 'China',          lat: 35.86,  lng: 104.20,  flag: '🇨🇳' },
  'india':          { name: 'India',          lat: 20.59,  lng: 78.96,   flag: '🇮🇳' },
  'singapore':      { name: 'Singapore',      lat: 1.35,   lng: 103.82,  flag: '🇸🇬' },
  'thailand':       { name: 'Thailand',       lat: 15.87,  lng: 100.99,  flag: '🇹🇭' },
  'vietnam':        { name: 'Vietnam',        lat: 14.06,  lng: 108.28,  flag: '🇻🇳' },
  'indonesia':      { name: 'Indonesia',      lat: -0.79,  lng: 113.92,  flag: '🇮🇩' },
  'malaysia':       { name: 'Malaysia',       lat: 4.21,   lng: 101.98,  flag: '🇲🇾' },
  'philippines':    { name: 'Philippines',    lat: 12.88,  lng: 121.77,  flag: '🇵🇭' },
  'taiwan':         { name: 'Taiwan',         lat: 23.70,  lng: 120.96,  flag: '🇹🇼' },
  'hong-kong':      { name: 'Hong Kong',      lat: 22.32,  lng: 114.17,  flag: '🇭🇰' },
  'bangladesh':     { name: 'Bangladesh',     lat: 23.69,  lng: 90.36,   flag: '🇧🇩' },
  'pakistan':       { name: 'Pakistan',       lat: 30.38,  lng: 69.35,   flag: '🇵🇰' },
  'sri-lanka':      { name: 'Sri Lanka',      lat: 7.87,   lng: 80.77,   flag: '🇱🇰' },
  'nepal':          { name: 'Nepal',          lat: 28.39,  lng: 84.12,   flag: '🇳🇵' },
  // Middle East / Central Asia
  'turkey':         { name: 'Turkey',         lat: 38.96,  lng: 35.24,   flag: '🇹🇷' },
  'jordan':         { name: 'Jordan',         lat: 30.59,  lng: 36.24,   flag: '🇯🇴' },
  'united-arab-emirates': { name: 'UAE',      lat: 23.42,  lng: 53.85,   flag: '🇦🇪' },
  'qatar':          { name: 'Qatar',          lat: 25.35,  lng: 51.18,   flag: '🇶🇦' },
  // Africa
  'south-africa':   { name: 'South Africa',   lat: -30.56, lng: 22.94,   flag: '🇿🇦' },
  'nigeria':        { name: 'Nigeria',        lat: 9.08,   lng: 8.68,    flag: '🇳🇬' },
  'kenya':          { name: 'Kenya',          lat: -0.02,  lng: 37.91,   flag: '🇰🇪' },
  'ghana':          { name: 'Ghana',          lat: 7.95,   lng: -1.02,   flag: '🇬🇭' },
  'ethiopia':       { name: 'Ethiopia',       lat: 9.15,   lng: 40.49,   flag: '🇪🇹' },
  'tanzania':       { name: 'Tanzania',       lat: -6.37,  lng: 34.89,   flag: '🇹🇿' },
  'morocco':        { name: 'Morocco',        lat: 31.79,  lng: -7.09,   flag: '🇲🇦' },
  'egypt':          { name: 'Egypt',          lat: 26.82,  lng: 30.80,   flag: '🇪🇬' },
  'rwanda':         { name: 'Rwanda',         lat: -1.94,  lng: 29.87,   flag: '🇷🇼' },
  'senegal':        { name: 'Senegal',        lat: 14.50,  lng: -14.45,  flag: '🇸🇳' },
  'zimbabwe':       { name: 'Zimbabwe',       lat: -19.02, lng: 29.15,   flag: '🇿🇼' },
};

// Section emoji & placeholder class
const SECTION_META = {
  science:      { emoji: '🔬', ph: 'ph-science' },
  technology:   { emoji: '💻', ph: 'ph-technology' },
  culture:      { emoji: '🎭', ph: 'ph-culture' },
  sport:        { emoji: '🏆', ph: 'ph-sport' },
  environment:  { emoji: '🌿', ph: 'ph-environment' },
  travel:       { emoji: '✈️', ph: 'ph-travel' },
  food:         { emoji: '🍽️', ph: 'ph-food' },
  film:         { emoji: '🎬', ph: 'ph-film' },
  music:        { emoji: '🎵', ph: 'ph-music' },
  books:        { emoji: '📚', ph: 'ph-books' },
  lifeandstyle: { emoji: '💫', ph: 'ph-lifeandstyle' },
  artanddesign: { emoji: '🎨', ph: 'ph-artanddesign' },
  stage:        { emoji: '🎪', ph: 'ph-culture' },
  education:    { emoji: '🎓', ph: 'ph-technology' },
};

// ─── Application State ───────────────────────────────────────
const state = {
  articles: [],        // All filtered articles loaded so far
  displayed: 0,        // How many article cards are rendered
  currentSection: 'all',
  currentPage: 1,
  searchQuery: '',
  isLoading: false,
  map: null,
  clusterGroup: null,
  countryArticles: {},   // country key → articles[]
};

// ─── Helpers ─────────────────────────────────────────────────

function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function sectionMeta(sectionId) {
  return SECTION_META[sectionId] || { emoji: '📰', ph: 'ph-default' };
}

/** Returns true if the text contains a blocklisted word */
function isNegative(text) {
  const lower = text.toLowerCase();
  return CFG.BLOCKLIST.some(kw => {
    // Use word-boundary match for short words to avoid false positives
    const re = kw.length <= 5
      ? new RegExp(`\\b${kw}\\b`, 'i')
      : new RegExp(kw, 'i');
    return re.test(lower);
  });
}

/** Detect a country from Guardian article tags and URL */
function detectCountry(article) {
  const haystack = [
    ...(article.tags || []).map(t => t.id || ''),
    article.webUrl || '',
    (article.fields?.trailText || '').slice(0, 200),
  ].join(' ').toLowerCase();

  for (const [key, info] of Object.entries(COUNTRIES)) {
    if (haystack.includes(key)) return { key, ...info };
  }
  return null;
}

// ─── API ──────────────────────────────────────────────────────

async function fetchFromGuardian(section, page = 1) {
  const sectionParam = section === 'all'
    ? CFG.HAPPY_SECTIONS.join('|')
    : section;

  const params = new URLSearchParams({
    'api-key':      CFG.API_KEY,
    section:        sectionParam,
    'page-size':    50,
    page:           page,
    'show-fields':  'thumbnail,trailText,byline',
    'show-tags':    'keyword',
    'order-by':     'newest',
  });

  const res = await fetch(`${CFG.BASE_URL}?${params}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json = await res.json();
  return json.response?.results || [];
}

/** Filter and enrich raw Guardian results */
function processArticles(raw) {
  return raw
    .filter(a => !isNegative(a.webTitle))
    .filter(a => !isNegative(a.fields?.trailText || ''))
    .map(a => ({
      id:        a.id,
      title:     a.webTitle,
      excerpt:   a.fields?.trailText || '',
      thumb:     a.fields?.thumbnail || null,
      byline:    a.fields?.byline || '',
      section:   a.sectionId,
      sectionName: a.sectionName,
      date:      a.webPublicationDate,
      url:       a.webUrl,
      tags:      a.tags || [],
      country:   detectCountry(a),
    }));
}

// ─── Rendering ───────────────────────────────────────────────

function buildThumb(article, cls = '') {
  const meta = sectionMeta(article.section);
  if (article.thumb) {
    return `<img src="${article.thumb}" alt="" loading="lazy" onerror="this.parentNode.innerHTML='<div class=\\"card-placeholder ${meta.ph}\\">${meta.emoji}</div>'">`;
  }
  return `<div class="card-placeholder ${meta.ph}">${meta.emoji}</div>`;
}

function renderFeatured(article) {
  if (!article) return;
  const meta = sectionMeta(article.section);
  const country = article.country;
  const flagHtml = country ? `<span class="country-flag">${country.flag}</span><span class="dot">·</span>` : '';

  document.getElementById('featuredStory').innerHTML = `
    <div class="featured-card">
      <a class="featured-inner" href="${article.url}" target="_blank" rel="noopener">
        <div class="featured-image">
          ${article.thumb
            ? `<img src="${article.thumb}" alt="" loading="lazy">`
            : `<div class="featured-placeholder ${meta.ph}">${meta.emoji}</div>`}
          <span class="featured-badge">Top Story</span>
        </div>
        <div class="featured-body">
          <div class="featured-tag">${article.sectionName}</div>
          <h2 class="featured-title">${article.title}</h2>
          <p class="featured-excerpt">${article.excerpt}</p>
          <div class="featured-meta">
            ${flagHtml}
            <span>${article.byline || 'The Guardian'}</span>
            <span class="dot">·</span>
            <span>${relativeTime(article.date)}</span>
          </div>
        </div>
      </a>
    </div>`;
}

function cardHtml(article) {
  const meta = sectionMeta(article.section);
  const country = article.country;
  const flagHtml = country ? `<span class="card-flag">${country.flag}</span><span class="card-dot">·</span>` : '';
  return `
    <a class="news-card" href="${article.url}" target="_blank" rel="noopener">
      <div class="card-thumb">${buildThumb(article)}</div>
      <div class="card-body">
        <div class="card-section">${article.sectionName}</div>
        <h3 class="card-title">${article.title}</h3>
        <div class="card-meta">
          ${flagHtml}
          <span>${article.byline || 'The Guardian'}</span>
          <span class="card-dot">·</span>
          <span>${relativeTime(article.date)}</span>
        </div>
      </div>
    </a>`;
}

function renderGrid(articles, append = false) {
  const grid = document.getElementById('newsGrid');
  const batch = articles.slice(state.displayed, state.displayed + CFG.PAGE_SIZE);
  if (!append) grid.innerHTML = '';
  grid.insertAdjacentHTML('beforeend', batch.map(cardHtml).join(''));
  state.displayed += batch.length;
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  if (state.displayed < articles.length) {
    loadMoreBtn.classList.remove('hidden');
  } else {
    loadMoreBtn.classList.add('hidden');
  }
}

function renderSidebar(articles) {
  // Pick up to 8 articles from different countries for the sidebar
  const seen = new Set();
  const picks = articles.filter(a => {
    if (!a.country) return false;
    if (seen.has(a.country.key)) return false;
    seen.add(a.country.key);
    return true;
  }).slice(0, 8);

  const el = document.getElementById('worldHighlights');
  if (!picks.length) { el.innerHTML = '<p style="font-size:13px;color:#80868b;padding:8px 0">No geolocated articles yet.</p>'; return; }
  el.innerHTML = picks.map(a => `
    <div class="world-item" onclick="window.open('${a.url}','_blank')">
      <span class="world-flag">${a.country.flag}</span>
      <div class="world-info">
        <div class="world-country">${a.country.name}</div>
        <div class="world-title">${a.title}</div>
      </div>
    </div>`).join('');
}

function updateBanner(count) {
  const emojis = ['🌟','🌈','☀️','🎉','🌺','🦋','🌏','✨','🎊','🌻'];
  document.getElementById('moodEmoji').textContent = emojis[Math.floor(Math.random() * emojis.length)];
  document.getElementById('articleCount').textContent =
    count
      ? `Found ${count} positive ${count === 1 ? 'story' : 'stories'} from around the world`
      : 'No stories matched — try a different category';
}

// ─── Map ─────────────────────────────────────────────────────

function initMap() {
  if (state.map) return; // already initialised

  state.map = L.map('map', { zoomControl: true }).setView([20, 10], 2);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
  }).addTo(state.map);

  state.clusterGroup = L.markerClusterGroup({ showCoverageOnHover: false });
  state.map.addLayer(state.clusterGroup);
}

function updateMapMarkers(articles) {
  if (!state.map) return;
  state.clusterGroup.clearLayers();
  state.countryArticles = {};

  // Group articles by country
  for (const article of articles) {
    if (!article.country) continue;
    const key = article.country.key;
    if (!state.countryArticles[key]) state.countryArticles[key] = { info: article.country, articles: [] };
    state.countryArticles[key].articles.push(article);
  }

  // Add one marker per country
  for (const [key, data] of Object.entries(state.countryArticles)) {
    const count = data.articles.length;
    const info  = data.info;

    const icon = L.divIcon({
      className: '',
      html: `<div class="custom-marker"><div class="custom-marker-inner">${count > 9 ? '9+' : count}</div></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -38],
    });

    const marker = L.marker([info.lat, info.lng], { icon });
    marker.bindPopup(`
      <div class="popup-title">${info.flag} ${info.name}</div>
      <div class="popup-count">${count} happy ${count === 1 ? 'story' : 'stories'}</div>`);

    marker.on('click', () => showCountryNews(key));
    state.clusterGroup.addLayer(marker);
  }
}

function showCountryNews(countryKey) {
  const data = state.countryArticles[countryKey];
  if (!data) return;
  const { info, articles } = data;
  const list = document.getElementById('mapNewsList');
  const title = document.getElementById('mapPanelTitle');
  const closeBtn = document.getElementById('closePanelBtn');

  title.textContent = `${info.flag} ${info.name} — ${articles.length} ${articles.length === 1 ? 'story' : 'stories'}`;
  closeBtn.classList.remove('hidden');

  const meta = (s) => sectionMeta(s);
  list.innerHTML = articles.map(a => {
    const m = meta(a.section);
    const thumbHtml = a.thumb
      ? `<img src="${a.thumb}" alt="" loading="lazy" onerror="this.parentNode.innerHTML='<div class=\\"map-card-ph ${m.ph}\\">${m.emoji}</div>'">`
      : `<div class="map-card-ph ${m.ph}">${m.emoji}</div>`;
    return `
      <a class="map-news-card" href="${a.url}" target="_blank" rel="noopener">
        <div class="map-card-thumb">${thumbHtml}</div>
        <div class="map-card-body">
          <div class="map-card-section">${a.sectionName}</div>
          <div class="map-card-title">${a.title}</div>
          <div class="map-card-time">${relativeTime(a.date)}</div>
        </div>
      </a>`;
  }).join('');
}

// ─── Search ──────────────────────────────────────────────────

function getFilteredArticles() {
  if (!state.searchQuery) return state.articles;
  const q = state.searchQuery.toLowerCase();
  return state.articles.filter(a =>
    a.title.toLowerCase().includes(q) ||
    a.excerpt.toLowerCase().includes(q) ||
    (a.country?.name || '').toLowerCase().includes(q));
}

// ─── Load & Display News ─────────────────────────────────────

async function loadNews(section = 'all', reset = true) {
  if (state.isLoading) return;
  state.isLoading = true;

  if (reset) {
    state.articles = [];
    state.displayed = 0;
    state.currentPage = 1;
  }

  document.getElementById('loadingState').classList.remove('hidden');
  document.getElementById('errorState').classList.add('hidden');
  document.getElementById('newsContent').classList.add('hidden');

  try {
    const raw  = await fetchFromGuardian(section, state.currentPage);
    const processed = processArticles(raw);
    state.articles.push(...processed);

    // If we got very few after filtering, try one more page automatically
    if (processed.length < 6 && state.currentPage === 1) {
      state.currentPage++;
      const raw2 = await fetchFromGuardian(section, state.currentPage);
      state.articles.push(...processArticles(raw2));
    }

    const filtered = getFilteredArticles();
    updateBanner(filtered.length);

    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('newsContent').classList.remove('hidden');

    if (filtered.length === 0) {
      document.getElementById('newsGrid').innerHTML =
        '<p style="padding:40px;color:#5f6368;font-size:14px">No happy stories found. Try a different category or check back later.</p>';
      return;
    }

    renderFeatured(filtered[0]);
    state.displayed = 1; // featured already shown
    renderGrid(filtered);
    renderSidebar(filtered);
    updateMapMarkers(filtered);

  } catch (err) {
    console.error(err);
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('errorState').classList.remove('hidden');
    document.getElementById('errorMsg').textContent =
      err.message.includes('401') || err.message.includes('403')
        ? 'Invalid API key. Open Settings and enter a valid Guardian API key.'
        : err.message;
  } finally {
    state.isLoading = false;
  }
}

// ─── View Switching ───────────────────────────────────────────

function showNewsView() {
  document.getElementById('newsView').classList.remove('hidden');
  document.getElementById('mapView').classList.add('hidden');
}

function showMapView() {
  document.getElementById('newsView').classList.add('hidden');
  document.getElementById('mapView').classList.remove('hidden');
  // Initialise map lazily on first visit
  setTimeout(() => {
    initMap();
    state.map.invalidateSize();
    updateMapMarkers(getFilteredArticles());
  }, 50);
}

// ─── Event Wiring ─────────────────────────────────────────────

function wireEvents() {
  // Category nav
  document.querySelectorAll('.nav-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const section = btn.dataset.section;
      if (section === 'map') {
        showMapView();
      } else {
        showNewsView();
        state.currentSection = section;
        state.searchQuery = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('searchClear').classList.add('hidden');
        loadNews(section);
      }
    });
  });

  // Load more
  document.getElementById('loadMoreBtn').addEventListener('click', () => {
    const filtered = getFilteredArticles();
    renderGrid(filtered, true);
  });

  // Search input
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');
  let searchTimer;
  searchInput.addEventListener('input', () => {
    state.searchQuery = searchInput.value.trim();
    searchClear.classList.toggle('hidden', !state.searchQuery);
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      const filtered = getFilteredArticles();
      updateBanner(filtered.length);
      state.displayed = 0;
      if (filtered.length) {
        document.getElementById('newsContent').classList.remove('hidden');
        document.getElementById('errorState').classList.add('hidden');
        renderFeatured(filtered[0]);
        state.displayed = 1;
        renderGrid(filtered);
        renderSidebar(filtered);
        updateMapMarkers(filtered);
      }
    }, 300);
  });
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    state.searchQuery = '';
    searchClear.classList.add('hidden');
    searchInput.dispatchEvent(new Event('input'));
  });

  // Refresh
  const refreshBtn = document.getElementById('refreshBtn');
  refreshBtn.addEventListener('click', () => {
    refreshBtn.classList.add('spinning');
    loadNews(state.currentSection).finally(() => refreshBtn.classList.remove('spinning'));
  });

  // Settings modal
  const settingsModal = document.getElementById('settingsModal');
  document.getElementById('settingsBtn').addEventListener('click', () => {
    document.getElementById('apiKeyInput').value = CFG.API_KEY;
    settingsModal.classList.remove('hidden');
  });
  document.getElementById('closeSettings').addEventListener('click', () => settingsModal.classList.add('hidden'));
  document.getElementById('cancelSettings').addEventListener('click', () => settingsModal.classList.add('hidden'));
  settingsModal.addEventListener('click', e => { if (e.target === settingsModal) settingsModal.classList.add('hidden'); });
  document.getElementById('saveSettings').addEventListener('click', () => {
    const key = document.getElementById('apiKeyInput').value.trim();
    if (key) localStorage.setItem('guardian_api_key', key);
    settingsModal.classList.add('hidden');
    loadNews(state.currentSection);
  });

  // Close map panel
  document.getElementById('closePanelBtn').addEventListener('click', () => {
    document.getElementById('mapNewsList').innerHTML = `
      <div class="map-empty">
        <div class="map-empty-icon">🗺️</div>
        <p>Markers show countries with happy news.<br>Click any marker to explore.</p>
      </div>`;
    document.getElementById('mapPanelTitle').textContent = 'Click a marker to see news';
    document.getElementById('closePanelBtn').classList.add('hidden');
  });

  // Retry
  document.getElementById('retryBtn').addEventListener('click', () => loadNews(state.currentSection));
}

// ─── Boot ─────────────────────────────────────────────────────

function init() {
  wireEvents();
  loadNews('all');
}

document.addEventListener('DOMContentLoaded', init);
