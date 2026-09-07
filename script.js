/* ==========================================
   Learning Hub – Application Logic
   Data source: websites.js (global variables: siteOwner, categories, websites)
   ========================================== */

(function() {
    'use strict';

    // ----- DOM refs -----
    const dashboard = document.getElementById('dashboard');
    const siteOwnerEl = document.getElementById('siteOwner');
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const searchIconBtn = document.getElementById('searchIconBtn');
    const searchExpand = document.getElementById('searchExpand');
    const searchInput = document.getElementById('search-input');
    const searchClose = document.getElementById('searchClose');

    // ----- State -----
    let allWebsites = [];
    let categoryOrder = [];
    let favouritesSet = new Set();  // will hold names of favourited sites

    // ----- Utility: get domain for favicon -----
    function getDomain(url) {
        try {
            return new URL(url).hostname;
        } catch (e) {
            return url.replace(/^https?:\/\//, '').split('/')[0];
        }
    }

    function getFaviconUrl(domain) {
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    }

    function createFallbackLogo(name) {
        const div = document.createElement('div');
        div.className = 'card-logo-fallback';
        div.textContent = name.charAt(0).toUpperCase();
        return div;
    }

    // ----- Create a card element -----
    function createCard(website) {
        const card = document.createElement('a');
        card.href = website.url;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.className = 'card';

        // Logo
        if (website.logo) {
            const img = document.createElement('img');
            img.className = 'card-logo';
            img.src = website.logo;
            img.alt = `${website.name} logo`;
            img.loading = 'lazy';
            img.onerror = () => card.replaceChild(createFallbackLogo(website.name), img);
            card.appendChild(img);
        } else {
            const faviconUrl = getFaviconUrl(getDomain(website.url));
            const img = document.createElement('img');
            img.className = 'card-logo';
            img.src = faviconUrl;
            img.alt = `${website.name} logo`;
            img.loading = 'lazy';
            img.onerror = () => card.replaceChild(createFallbackLogo(website.name), img);
            card.appendChild(img);
        }

        // Name
        const nameEl = document.createElement('div');
        nameEl.className = 'card-name';
        nameEl.textContent = website.name;
        card.appendChild(nameEl);

        // Description
        if (website.description) {
            const descEl = document.createElement('div');
            descEl.className = 'card-description';
            descEl.textContent = website.description;
            card.appendChild(descEl);
        }

        // Pin button (favourite)
        const pinBtn = document.createElement('button');
        pinBtn.className = 'pin-btn' + (favouritesSet.has(website.name) ? ' pinned' : '');
        pinBtn.setAttribute('aria-label', `Pin ${website.name}`);
        pinBtn.textContent = favouritesSet.has(website.name) ? '★' : '☆';
        pinBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavourite(website.name, pinBtn);
        });
        card.appendChild(pinBtn);

        return card;
    }

    // ----- Toggle favourite status -----
    function toggleFavourite(name, pinBtnElement) {
        if (favouritesSet.has(name)) {
            favouritesSet.delete(name);
            if (pinBtnElement) {
                pinBtnElement.classList.remove('pinned');
                pinBtnElement.textContent = '☆';
            }
        } else {
            favouritesSet.add(name);
            if (pinBtnElement) {
                pinBtnElement.classList.add('pinned');
                pinBtnElement.textContent = '★';
            }
        }
        // Persist to localStorage
        localStorage.setItem('ireally-favourites', JSON.stringify([...favouritesSet]));
        // Re-render dashboard to move cards between Favourites section and categories
        renderDashboard(allWebsites, categoryOrder);
    }

    // ----- Build the entire dashboard -----
    function renderDashboard(websites, categories) {
        dashboard.innerHTML = '';

        // Determine favourites
        const favWebsites = websites.filter(w => favouritesSet.has(w.name));
        const nonFavWebsites = websites.filter(w => !favouritesSet.has(w.name));

        // Create "Favourites" section at top if any favourites exist
        if (favWebsites.length > 0) {
            const favSection = document.createElement('section');
            favSection.className = 'category-section';
            favSection.dataset.category = '__favourites__';

            const title = document.createElement('h2');
            title.className = 'category-title';
            title.innerHTML = `⭐ Favourites <span class="category-count">${favWebsites.length}</span>`;
            favSection.appendChild(title);

            const grid = document.createElement('div');
            grid.className = 'category-grid';
            favWebsites.forEach(w => grid.appendChild(createCard(w)));
            favSection.appendChild(grid);
            dashboard.appendChild(favSection);
        }

        // Merge category order with any extra categories found in data
        const knownCategories = [...categories];
        nonFavWebsites.forEach(w => {
            if (!knownCategories.includes(w.category)) {
                knownCategories.push(w.category);
            }
        });

        // Render each category (only non-favourited websites)
        knownCategories.forEach(cat => {
            const catWebsites = nonFavWebsites.filter(w => w.category === cat);
            if (catWebsites.length === 0) return;

            const section = document.createElement('section');
            section.className = 'category-section';
            section.dataset.category = cat;

            const title = document.createElement('h2');
            title.className = 'category-title';
            title.innerHTML = `${cat} <span class="category-count">${catWebsites.length}</span>`;
            section.appendChild(title);

            const grid = document.createElement('div');
            grid.className = 'category-grid';
            catWebsites.forEach(w => grid.appendChild(createCard(w)));
            section.appendChild(grid);

            dashboard.appendChild(section);
        });
    }

    // ----- Update category counts after search filter -----
    function updateCategoryCounts() {
        dashboard.querySelectorAll('.category-section').forEach(section => {
            const visibleCards = Array.from(section.querySelectorAll('.card'))
                .filter(card => card.style.display !== 'none');
            const countEl = section.querySelector('.category-count');
            if (countEl) countEl.textContent = visibleCards.length;
        });
    }

    // ----- Filter by name only -----
    function filterByName(query) {
        const lowerQuery = query.toLowerCase().trim();
        const sections = dashboard.querySelectorAll('.category-section');
        sections.forEach(section => {
            const cards = Array.from(section.querySelectorAll('.card'));
            let visible = 0;
            cards.forEach(card => {
                const nameEl = card.querySelector('.card-name');
                const name = nameEl ? nameEl.textContent.toLowerCase() : '';
                if (name.includes(lowerQuery)) {
                    card.style.display = '';
                    visible++;
                } else {
                    card.style.display = 'none';
                }
            });
            section.style.display = visible === 0 ? 'none' : '';
        });
        updateCategoryCounts();
    }

    // ----- Search expand/collapse -----
    function openSearch() {
        searchExpand.classList.add('open');
        searchInput.focus();
    }
    function closeSearch() {
        searchExpand.classList.remove('open');
        searchInput.value = '';
        filterByName('');
    }

    searchIconBtn.addEventListener('click', openSearch);
    searchClose.addEventListener('click', closeSearch);
    searchInput.addEventListener('input', () => {
        filterByName(searchInput.value);
    });

    // Close search when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchExpand.contains(e.target) && !searchIconBtn.contains(e.target)) {
            if (searchExpand.classList.contains('open') && searchInput.value === '') {
                closeSearch();
            }
        }
    });

    // ----- Theme toggle -----
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        localStorage.setItem('ireally-theme', theme);
    }

    function initTheme() {
        const saved = localStorage.getItem('ireally-theme');
        if (saved) {
            applyTheme(saved);
        } else {
            applyTheme('dark'); // default dark
        }
    }

    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        applyTheme(current === 'dark' ? 'light' : 'dark');
    });

    // ----- Load favourites from localStorage -----
    function initFavourites() {
        const saved = localStorage.getItem('ireally-favourites');
        if (saved) {
            try {
                const arr = JSON.parse(saved);
                favouritesSet = new Set(arr);
            } catch (e) {
                favouritesSet = new Set();
            }
        }
        // Also include any website with `favourite: true` from data
        allWebsites.forEach(w => {
            if (w.favourite === true) favouritesSet.add(w.name);
        });
        // Save back to localStorage in case new favourites were added from data
        localStorage.setItem('ireally-favourites', JSON.stringify([...favouritesSet]));
    }

    // ----- Initialize -----
    function init() {
        // Set site owner name
        if (typeof siteOwner !== 'undefined' && siteOwner) {
            siteOwnerEl.textContent = siteOwner;
        }

        // Load data globals
        if (typeof websites !== 'undefined' && Array.isArray(websites)) {
            allWebsites = websites;
        } else {
            allWebsites = [];
            console.warn('websites.js did not define a valid `websites` array.');
        }
        if (typeof categories !== 'undefined' && Array.isArray(categories)) {
            categoryOrder = categories;
        } else {
            categoryOrder = [];
            console.warn('websites.js did not define a valid `categories` array.');
        }

        initTheme();
        initFavourites();
        renderDashboard(allWebsites, categoryOrder);
    }

    init();
})();
