(() => {
    "use strict";

    const resourceContainer = document.getElementById("resource-container");
    const searchInput = document.getElementById("search-input");
    const clearSearchButton = document.getElementById("clear-search");
    const siteTitle = document.getElementById("site-title");

    const faviconService = "https://www.google.com/s2/favicons?sz=128&domain=";

    function getOrigin(url) {
        try {
            return new URL(url).origin;
        } catch {
            return "";
        }
    }

    function getInitials(name) {
        const words = name.trim().split(/\s+/).filter(Boolean);

        if (words.length === 1) {
            return words[0].slice(0, 2).toUpperCase();
        }

        return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }

    function createFallbackLogo(name) {
        const fallback = document.createElement("span");
        fallback.className = "resource-logo fallback";
        fallback.textContent = getInitials(name);
        fallback.setAttribute("aria-hidden", "true");
        return fallback;
    }

    function createLogo(resource) {
        const wrapper = document.createElement("div");
        wrapper.className = "resource-logo-wrap";

        const logo = document.createElement("img");
        logo.className = "resource-logo";
        logo.alt = "";
        logo.loading = "lazy";
        logo.decoding = "async";

        const origin = getOrigin(resource.url);
        const automaticLogo = origin
            ? `${origin}/favicon.ico`
            : "";

        const serviceLogo = origin
            ? `${faviconService}${encodeURIComponent(origin)}`
            : "";

        const candidates = [
            resource.logo,
            automaticLogo,
            serviceLogo
        ].filter(Boolean);

        let candidateIndex = 0;

        const useNextLogo = () => {
            if (candidateIndex < candidates.length) {
                logo.src = candidates[candidateIndex];
                candidateIndex += 1;
            } else {
                logo.remove();
                wrapper.appendChild(createFallbackLogo(resource.name));
            }
        };

        logo.addEventListener("error", useNextLogo);

        if (candidates.length > 0) {
            useNextLogo();
            wrapper.appendChild(logo);
        } else {
            wrapper.appendChild(createFallbackLogo(resource.name));
        }

        return wrapper;
    }

    function createCard(resource) {
        const card = document.createElement("a");
        card.className = "resource-card";
        card.href = resource.url;
        card.target = "_blank";
        card.rel = "noopener noreferrer";
        card.setAttribute("aria-label", `Open ${resource.name}`);

        card.appendChild(createLogo(resource));

        const name = document.createElement("div");
        name.className = "resource-name";
        name.textContent = resource.name;
        card.appendChild(name);

        const description = document.createElement("div");
        description.className = "resource-description";
        description.textContent = resource.description || "";
        card.appendChild(description);

        return card;
    }

    function getCategoryOrder() {
        const preferred = Array.isArray(categories) ? categories : [];
        const preferredSet = new Set(preferred);

        // Categories present in the data but absent from the preferred list
        // are appended in their first-seen order, so nothing silently disappears.
        const discovered = websites
            .map(resource => resource.category)
            .filter(Boolean)
            .filter(category => !preferredSet.has(category));

        return [...preferred, ...new Set(discovered)];
    }

    function groupByCategory(resources) {
        const groups = new Map();

        for (const resource of resources) {
            if (!resource || !resource.name || !resource.url || !resource.category) {
                continue;
            }

            if (!groups.has(resource.category)) {
                groups.set(resource.category, []);
            }

            groups.get(resource.category).push(resource);
        }

        return groups;
    }

    function render(query = "") {
        const normalizedQuery = query.trim().toLocaleLowerCase();
        const filteredResources = websites.filter(resource =>
            resource.name.toLocaleLowerCase().includes(normalizedQuery)
        );

        const groups = groupByCategory(filteredResources);
        const categoryOrder = getCategoryOrder();

        resourceContainer.replaceChildren();

        let visibleCategoryCount = 0;

        for (const category of categoryOrder) {
            const resources = groups.get(category);

            if (!resources || resources.length === 0) {
                continue;
            }

            const section = document.createElement("section");
            section.className = "category-section";

            const heading = document.createElement("h2");
            heading.className = "category-title";
            heading.textContent = category;
            section.appendChild(heading);

            const grid = document.createElement("div");
            grid.className = "resource-grid";

            for (const resource of resources) {
                grid.appendChild(createCard(resource));
            }

            section.appendChild(grid);
            resourceContainer.appendChild(section);
            visibleCategoryCount += 1;
        }

        if (visibleCategoryCount === 0) {
            const emptyState = document.createElement("p");
            emptyState.className = "empty-state";
            emptyState.textContent = normalizedQuery
                ? "No resources match your search."
                : "No resources available.";
            resourceContainer.appendChild(emptyState);
        }
    }

    function updateSearchUI() {
        clearSearchButton.hidden = searchInput.value.length === 0;
    }

    siteTitle.textContent = siteOwner;
    searchInput.addEventListener("input", () => {
        render(searchInput.value);
        updateSearchUI();
    });

    clearSearchButton.addEventListener("click", () => {
        searchInput.value = "";
        render();
        updateSearchUI();
        searchInput.focus();
    });

    render();
})();
