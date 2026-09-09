// ===== STATE =====
const appState = {
    theme: 'dark',
    searchQuery: '',
    searchOpen: false,
    favourites: [],
    data: { siteOwner: '', categories: [], websites: [] }
};

// ===== DOM REFS =====
const dashboard = document.getElementById('dashboard');
const siteOwnerEl = document.getElementById('siteOwner');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('.theme-icon');
const searchToggle = document.getElementById('searchToggle');
const searchBar = document.getElementById('searchBar');
const searchInput = document.getElementById('searchInput');
const searchClose = document.getElementById('searchClose');
const noResults = document.getElementById('noResults');
const cursorTrail = document.getElementById('cursorTrail');

// ===== LOAD DATA =====
function loadData() {
    if (typeof siteOwner !== 'undefined') appState.data.siteOwner = siteOwner;
    if (typeof categories !== 'undefined') appState.data.categories = categories;
    if (typeof websites !== 'undefined') appState.data.websites = websites;
}

// ===== LOCAL STORAGE =====
const STORAGE_FAV = 'ireally-favourites';
const STORAGE_THEME = 'ireally-theme';

function loadFavourites() {
    const stored = localStorage.getItem(STORAGE_FAV);
    if (stored) {
        try { appState.favourites = JSON.parse(stored); } catch (_) { appState.favourites = []; }
    } else {
        appState.favourites = appState.data.websites.filter(w => w.favourite === true).map(w => w.name);
        saveFavourites();
    }
}
function saveFavourites() { localStorage.setItem(STORAGE_FAV, JSON.stringify(appState.favourites)); }
function loadTheme() {
    const stored = localStorage.getItem(STORAGE_THEME);
    appState.theme = (stored === 'light') ? 'light' : 'dark';
    applyTheme();
}
function saveTheme() { localStorage.setItem(STORAGE_THEME, appState.theme); }
function applyTheme() {
    if (appState.theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        themeIcon.textContent = '☀️';
    } else {
        document.documentElement.removeAttribute('data-theme');
        themeIcon.textContent = '🌙';
    }
}

// ===== RENDER ENGINE =====
function render() {
    const { siteOwner, categories, websites } = appState.data;
    const query = appState.searchQuery.toLowerCase().trim();
    const favSet = new Set(appState.favourites);

    siteOwnerEl.textContent = siteOwner || 'Learning Hub';

    let cards = websites.map(w => ({
        ...w,
        isFav: favSet.has(w.name),
        visible: query === '' || w.name.toLowerCase().includes(query)
    }));

    const orderedCategories = [...categories];
    for (const w of cards) {
        if (w.category && !orderedCategories.includes(w.category)) {
            orderedCategories.push(w.category);
        }
    }

    const categoryMap = new Map();
    for (const cat of orderedCategories) {
        const items = cards.filter(w => w.category === cat);
        if (items.length) categoryMap.set(cat, items);
    }
    const favItems = cards.filter(w => w.isFav);
    const hasFav = favItems.length > 0;
    const totalVisible = cards.filter(w => w.visible).length;
    noResults.classList.toggle('visible', totalVisible === 0);

    let html = '';
    if (hasFav) {
        const visibleFavs = favItems.filter(w => w.visible);
        html += `<section class="category-section" data-category="__favourites">`;
        html += `<div class="category-header"><span class="category-accent" style="background:#ffb84d;"></span>`;
        html += `<span class="category-title">⭐ Favourites</span>`;
        html += `<span class="category-count" id="favCount">${visibleFavs.length}</span></div>`;
        html += `<div class="cards-grid">`;
        for (const w of visibleFavs) html += buildCard(w);
        html += `</div></section>`;
    }

    for (const [cat, items] of categoryMap) {
        const visibleItems = items.filter(w => w.visible);
        if (visibleItems.length === 0) continue;
        const hue = getCategoryHue(cat);
        html += `<section class="category-section" data-category="${cat}">`;
        html += `<div class="category-header"><span class="category-accent" style="background:hsl(${hue},60%,55%);"></span>`;
        html += `<span class="category-title">${cat}</span>`;
        html += `<span class="category-count" data-cat="${cat}">${visibleItems.length}</span></div>`;
        html += `<div class="cards-grid">`;
        for (const w of visibleItems) html += buildCard(w);
        html += `</div></section>`;
    }

    dashboard.innerHTML = html;

    // Apply staggered visibility with class (no animation conflict)
    const cardsEl = dashboard.querySelectorAll('.card');
    cardsEl.forEach((card, index) => {
        const delay = Math.min(index * 30, 400);
        setTimeout(() => card.classList.add('card-visible'), delay);
    });

    attachEventListeners();

    // Animate count badges
    document.querySelectorAll('.category-count').forEach(el => {
        el.classList.remove('pop');
        void el.offsetWidth;
        el.classList.add('pop');
    });
}

function buildCard(website) {
    const name = website.name || 'Untitled';
    const url = website.url || '#';
    const desc = website.description || '';
    const fav = website.isFav ? 'active' : '';
    const star = fav ? '★' : '☆';
    const logoUrl = website.logo || `https://www.google.com/s2/favicons?domain=${getDomain(url)}&sz=64`;
    const safeName = escapeHTML(name);
    const safeDesc = escapeHTML(desc);
    const safeUrl = escapeHTML(url);
    return `
        <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="card" data-name="${safeName}" data-url="${safeUrl}">
            <div class="card-logo">
                <div class="logo-placeholder"></div>
                <img src="${logoUrl}" alt="${safeName} logo" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" onload="this.classList.add('loaded'); this.previousElementSibling.style.display='none';" />
                <div class="logo-fallback" style="display:none;">${safeName.charAt(0).toUpperCase()}</div>
            </div>
            <div class="card-name">${safeName}</div>
            <div class="card-desc">${safeDesc}</div>
            <button class="card-star ${fav}" data-name="${safeName}" aria-label="Toggle favourite">${star}</button>
            <div class="card-loader"><div class="spinner"></div></div>
        </a>
    `;
}

function getDomain(url) {
    try { return new URL(url).hostname; } catch (_) { return ''; }
}
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
function getCategoryHue(cat) {
    let hash = 0;
    for (let i = 0; i < cat.length; i++) hash = cat.charCodeAt(i) + ((hash << 5) - hash);
    return 210 + (Math.abs(hash) % 40);
}

// ===== EVENT LISTENERS =====
function attachEventListeners() {
    document.querySelectorAll('.card-star').forEach(btn => {
        btn.removeEventListener('click', handleStarClick);
        btn.addEventListener('click', handleStarClick);
    });
    document.querySelectorAll('.card').forEach(card => {
        card.removeEventListener('click', handleCardClick);
        card.addEventListener('click', handleCardClick);
    });
}

function handleStarClick(e) {
    e.stopPropagation();
    e.preventDefault();
    const name = e.currentTarget.getAttribute('data-name');
    if (!name) return;
    const idx = appState.favourites.indexOf(name);
    if (idx > -1) appState.favourites.splice(idx, 1);
    else appState.favourites.push(name);
    saveFavourites();
    smoothReRender();
}

function handleCardClick(e) {
    const card = e.currentTarget;
    const url = card.getAttribute('data-url');
    if (!url || url === '#') return;
    e.preventDefault();
    const loader = card.querySelector('.card-loader');
    if (loader) loader.classList.add('active');
    setTimeout(() => {
        window.open(url, '_blank', 'noopener,noreferrer');
        setTimeout(() => { if (loader) loader.classList.remove('active'); }, 100);
    }, 1500);
}

function smoothReRender() {
    dashboard.classList.add('updating');
    setTimeout(() => {
        render();
        dashboard.classList.remove('updating');
        if (appState.searchOpen) {
            searchBar.classList.add('open');
            searchInput.focus();
        }
    }, 300);
}

// ===== SEARCH =====
function updateSearch() {
    appState.searchQuery = searchInput.value;
    smoothReRender();
}
function openSearch() {
    appState.searchOpen = true;
    searchBar.classList.add('open');
    searchInput.focus();
    searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
}
function closeSearch() {
    appState.searchOpen = false;
    searchBar.classList.remove('open');
    searchInput.value = '';
    appState.searchQuery = '';
    smoothReRender();
}

// ===== THEME =====
function toggleTheme() {
    appState.theme = (appState.theme === 'dark') ? 'light' : 'dark';
    applyTheme();
    saveTheme();
    themeToggle.classList.add('rotated');
    setTimeout(() => themeToggle.classList.remove('rotated'), 600);
}

// ===== CURSOR TRAIL (90% longer = 19 dots, brighter) =====
const TRAIL_LENGTH = 19;   // 90% longer than 10
let cursorDots = [];
let mouseX = 0, mouseY = 0;
let isCursorVisible = false;

function initCursorTrail() {
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    for (let i = 0; i < TRAIL_LENGTH; i++) {
        const dot = document.createElement('div');
        dot.className = 'cursor-dot' + (i === 0 ? ' cursor-dot-main' : ' cursor-dot-trail');
        cursorTrail.appendChild(dot);
        cursorDots.push({ el: dot, x: 0, y: 0 });
    }

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!isCursorVisible) {
            isCursorVisible = true;
            cursorTrail.style.opacity = '1';
        }
    });
    document.addEventListener('mouseleave', () => {
        isCursorVisible = false;
        cursorTrail.style.opacity = '0';
    });

    let positions = Array(TRAIL_LENGTH).fill({ x: 0, y: 0 });
    function updateTrail() {
        if (isCursorVisible) {
            positions = [{ x: mouseX, y: mouseY }, ...positions.slice(0, -1)];
            for (let i = 0; i < cursorDots.length; i++) {
                const p = positions[i] || positions[positions.length - 1];
                cursorDots[i].el.style.transform = `translate(${p.x}px, ${p.y}px)`;
                if (i > 0) {
                    const alpha = 0.5 - (i / TRAIL_LENGTH) * 0.4;  // slightly higher opacity
                    cursorDots[i].el.style.opacity = alpha;
                }
            }
        }
        requestAnimationFrame(updateTrail);
    }
    updateTrail();
}

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && !e.ctrlKey && !e.metaKey)) {
        e.preventDefault();
        if (!appState.searchOpen) openSearch();
        else searchInput.focus();
    }
    if (e.key === 'Escape' && appState.searchOpen) closeSearch();
});

document.addEventListener('click', (e) => {
    if (appState.searchOpen) {
        const wrapper = document.querySelector('.search-wrapper');
        if (!wrapper.contains(e.target)) closeSearch();
    }
});

// ===== INIT =====
function init() {
    loadData();
    loadTheme();
    loadFavourites();
    render();
    themeToggle.addEventListener('click', toggleTheme);
    searchToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        appState.searchOpen ? closeSearch() : openSearch();
    });
    searchInput.addEventListener('input', updateSearch);
    searchClose.addEventListener('click', (e) => { e.stopPropagation(); closeSearch(); });
    initCursorTrail();
}

try {
    init();
} catch (err) {
    console.warn('App init error:', err);
    dashboard.innerHTML = `<p style="color: var(--text-secondary); padding:40px; text-align:center;">⚠️ Something went wrong. Check <code>websites.js</code>.</p>`;
}
