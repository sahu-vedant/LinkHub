// ===== STATE =====
const appState = {
    theme: 'dark',       // 'dark' or 'light'
    searchQuery: '',
    searchOpen: false,
    favourites: [],      // array of website names (or IDs)
    data: {
        siteOwner: '',
        categories: [],
        websites: []
    }
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

// ===== LOAD DATA FROM websites.js =====
function loadData() {
    // Data is expected to be globally defined: siteOwner, categories, websites
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
        try {
            appState.favourites = JSON.parse(stored);
        } catch (_) { appState.favourites = []; }
    } else {
        // Initial favourites from data
        const initial = appState.data.websites
            .filter(w => w.favourite === true)
            .map(w => w.name);
        appState.favourites = initial;
        saveFavourites();
    }
}

function saveFavourites() {
    localStorage.setItem(STORAGE_FAV, JSON.stringify(appState.favourites));
}

function loadTheme() {
    const stored = localStorage.getItem(STORAGE_THEME);
    if (stored === 'light') {
        appState.theme = 'light';
    } else {
        appState.theme = 'dark';
    }
    applyTheme();
}

function saveTheme() {
    localStorage.setItem(STORAGE_THEME, appState.theme);
}

function applyTheme() {
    if (appState.theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        themeIcon.textContent = '☀️';
    } else {
        document.documentElement.removeAttribute('data-theme');
        themeIcon.textContent = '🌙';
    }
    // Update cursor color via CSS variable (already handled)
}

// ===== RENDER ENGINE =====
function render() {
    const { siteOwner, categories, websites } = appState.data;
    const query = appState.searchQuery.toLowerCase().trim();
    const favSet = new Set(appState.favourites);

    // Update site owner
    siteOwnerEl.textContent = siteOwner || 'Learning Hub';

    // Prepare card data with visibility and fav status
    let cards = websites.map(w => ({
        ...w,
        isFav: favSet.has(w.name),
        visible: query === '' || w.name.toLowerCase().includes(query)
    }));

    // Group by category
    const categoryMap = new Map();
    // Create categories in preferred order
    const orderedCategories = [...categories];
    // Add any categories from data not in the list (append)
    for (const w of cards) {
        if (w.category && !orderedCategories.includes(w.category)) {
            orderedCategories.push(w.category);
        }
    }

    // Build category groups
    for (const cat of orderedCategories) {
        const items = cards.filter(w => w.category === cat);
        if (items.length > 0) {
            categoryMap.set(cat, items);
        }
    }

    // Extract favourites
    const favItems = cards.filter(w => w.isFav);
    const hasFav = favItems.length > 0;

    // Update no-results
    const totalVisible = cards.filter(w => w.visible).length;
    if (totalVisible === 0) {
        noResults.classList.add('visible');
    } else {
        noResults.classList.remove('visible');
    }

    // ---- Build HTML ----
    let html = '';

    // Favourites section (top)
    if (hasFav) {
        const visibleFavs = favItems.filter(w => w.visible);
        html += `<section class="category-section" data-category="__favourites">`;
        html += `<div class="category-header">`;
        html += `<span class="category-accent" style="background: #ffb84d;"></span>`;
        html += `<span class="category-title">⭐ Favourites</span>`;
        html += `<span class="category-count" id="favCount">${visibleFavs.length}</span>`;
        html += `</div>`;
        html += `<div class="cards-grid">`;
        for (const w of visibleFavs) {
            html += buildCard(w);
        }
        html += `</div></section>`;
    }

    // Other categories
    for (const [cat, items] of categoryMap) {
        const visibleItems = items.filter(w => w.visible);
        if (visibleItems.length === 0) continue;

        // Assign accent colour (subtle blue/indigo range)
        const hue = getCategoryHue(cat);
        html += `<section class="category-section" data-category="${cat}">`;
        html += `<div class="category-header">`;
        html += `<span class="category-accent" style="background: hsl(${hue}, 60%, 55%);"></span>`;
        html += `<span class="category-title">${cat}</span>`;
        html += `<span class="category-count" data-cat="${cat}">${visibleItems.length}</span>`;
        html += `</div>`;
        html += `<div class="cards-grid">`;
        for (const w of visibleItems) {
            html += buildCard(w);
        }
        html += `</div></section>`;
    }

    dashboard.innerHTML = html;

    // Update category counts after render (they are already set)
    // Re-attach event listeners for stars and cards
    attachEventListeners();

    // Trigger animation for count badges
    document.querySelectorAll('.category-count').forEach(el => {
        el.classList.remove('pop');
        // Force reflow
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

    // Escape for HTML
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
    try {
        const u = new URL(url);
        return u.hostname;
    } catch (_) {
        return '';
    }
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function getCategoryHue(cat) {
    // Deterministic hue between 210 and 250 (blue/indigo)
    let hash = 0;
    for (let i = 0; i < cat.length; i++) {
        hash = cat.charCodeAt(i) + ((hash << 5) - hash);
    }
    return 210 + (Math.abs(hash) % 40);
}

// ===== EVENT LISTENERS (dynamic) =====
function attachEventListeners() {
    // Star buttons
    document.querySelectorAll('.card-star').forEach(btn => {
        btn.removeEventListener('click', handleStarClick);
        btn.addEventListener('click', handleStarClick);
    });

    // Card click: loading overlay
    document.querySelectorAll('.card').forEach(card => {
        card.removeEventListener('click', handleCardClick);
        card.addEventListener('click', handleCardClick);
    });
}

function handleStarClick(e) {
    e.stopPropagation();
    e.preventDefault();
    const btn = e.currentTarget;
    const name = btn.getAttribute('data-name');
    if (!name) return;

    // Toggle in state
    const idx = appState.favourites.indexOf(name);
    if (idx > -1) {
        appState.favourites.splice(idx, 1);
    } else {
        appState.favourites.push(name);
    }
    saveFavourites();

    // Re-render with a smooth transition
    smoothReRender();
}

function handleCardClick(e) {
    // Only if clicked directly on card or its children (but not star)
    const card = e.currentTarget;
    const url = card.getAttribute('data-url');
    if (!url || url === '#') return;

    // Prevent default navigation for now
    e.preventDefault();

    // Show loader
    const loader = card.querySelector('.card-loader');
    if (loader) {
        loader.classList.add('active');
    }

    // After 1.5s, open the link
    setTimeout(() => {
        window.open(url, '_blank', 'noopener,noreferrer');
        // Fade out loader after a tiny delay (allow tab to open)
        setTimeout(() => {
            if (loader) loader.classList.remove('active');
        }, 100);
    }, 700);
}

function smoothReRender() {
    // Add updating class to dashboard to fade out cards
    dashboard.classList.add('updating');
    // After transition (0.3s), re-render and remove class
    setTimeout(() => {
        render();
        dashboard.classList.remove('updating');
        // Re-apply any open search state
        if (appState.searchOpen) {
            searchBar.classList.add('open');
            searchInput.focus();
        }
    }, 300);
}

// ===== SEARCH =====
function updateSearch() {
    const query = searchInput.value;
    appState.searchQuery = query;
    // Use smooth re-render (with fade)
    smoothReRender();
}

function openSearch() {
    appState.searchOpen = true;
    searchBar.classList.add('open');
    searchInput.focus();
    // Ensure cursor at end
    searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
}

function closeSearch() {
    appState.searchOpen = false;
    searchBar.classList.remove('open');
    searchInput.value = '';
    appState.searchQuery = '';
    // Re-render to show all
    smoothReRender();
}

// ===== THEME TOGGLE =====
function toggleTheme() {
    appState.theme = (appState.theme === 'dark') ? 'light' : 'dark';
    applyTheme();
    saveTheme();
    // Rotate icon
    themeToggle.classList.add('rotated');
    setTimeout(() => themeToggle.classList.remove('rotated'), 600);
}

// ===== CURSOR TRAIL =====
let cursorDots = [];
const TRAIL_LENGTH = 10;
let mouseX = 0, mouseY = 0;
let isCursorVisible = false;

function initCursorTrail() {
    // Only if not touch and not reduced motion
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    for (let i = 0; i < TRAIL_LENGTH; i++) {
        const dot = document.createElement('div');
        dot.className = 'cursor-dot' + (i === 0 ? ' cursor-dot-main' : ' cursor-dot-trail');
        cursorTrail.appendChild(dot);
        cursorDots.push({
            el: dot,
            x: 0,
            y: 0
        });
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

    // Update positions with RAF
    let positions = Array(TRAIL_LENGTH).fill({ x: 0, y: 0 });
    function updateTrail() {
        if (isCursorVisible) {
            // Shift positions
            positions = [{ x: mouseX, y: mouseY }, ...positions.slice(0, -1)];
            for (let i = 0; i < cursorDots.length; i++) {
                const p = positions[i] || positions[positions.length - 1];
                cursorDots[i].el.style.transform = `translate(${p.x}px, ${p.y}px)`;
                // Opacity fade for trail
                if (i > 0) {
                    const alpha = 0.4 - (i / TRAIL_LENGTH) * 0.35;
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
    // Ctrl+K or / to open search
    if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && !e.ctrlKey && !e.metaKey)) {
        e.preventDefault();
        if (!appState.searchOpen) {
            openSearch();
        } else {
            searchInput.focus();
        }
    }
    // Escape to close search
    if (e.key === 'Escape' && appState.searchOpen) {
        closeSearch();
    }
});

// ===== CLICK OUTSIDE SEARCH =====
document.addEventListener('click', (e) => {
    if (appState.searchOpen) {
        const searchWrapper = document.querySelector('.search-wrapper');
        if (!searchWrapper.contains(e.target)) {
            closeSearch();
        }
    }
});

// ===== INIT =====
function init() {
    loadData();
    loadTheme();
    loadFavourites();
    render();

    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Search
    searchToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (appState.searchOpen) {
            closeSearch();
        } else {
            openSearch();
        }
    });
    searchInput.addEventListener('input', updateSearch);
    searchClose.addEventListener('click', (e) => {
        e.stopPropagation();
        closeSearch();
    });

    // Init cursor
    initCursorTrail();

    // Handle potential data changes (though user edits websites.js, we can re-load on visibility change?)
    // Not needed for static.
}

// Error boundary: catch errors in render and show fallback
try {
    init();
} catch (err) {
    console.warn('App initialization error:', err);
    dashboard.innerHTML = `<p style="color: var(--text-secondary); padding: 40px; text-align: center;">⚠️ Something went wrong loading the dashboard. Please check your <code>websites.js</code> file.</p>`;
}
