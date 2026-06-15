/* ==========================================================================
   Interactive Engine for HavenQuest
   ========================================================================== */

// Base Simulated Article Database
const localArticles = [
    {
        "title": "Mortgage Rate Reductions: What Buyers Need to Know",
        "excerpt": "With the 30-year fixed rate dropping below 6%, active buyers are re-entering the housing market. What this means for home valuations.",
        "category": "Mortgages",
        "author": "Charles Vance",
        "date": "3 hours ago",
        "readTime": "5 min read",
        "body": "<p>The residential housing market is seeing increased activity as mortgage rates descend from their recent highs. With the average 30-year fixed mortgage rate dropping below 6%, potential buyers who had been priced out are re-entering the market.</p><p>This surge in demand, combined with tight housing inventories, is stabilizing home prices in metropolitan areas. Realtors report increases in open house attendance and multiple-offer scenarios.</p><p>For buyers, locking in a lower rate can save hundreds of dollars monthly, though preparing for competition is key in high-demand neighborhoods.</p>",
        "premium": true
    },
    {
        "title": "Eco-Luxury: The Rise of Sustainable Smart Home Features",
        "excerpt": "Homeowners are prioritizing geothermal heat pumps, solar arrays, and high-performance insulation in premium property markets.",
        "category": "Luxury Real Estate",
        "author": "Elena Rostova",
        "date": "5 hours ago",
        "readTime": "4 min read",
        "body": "<p>Sustainable architecture features have transitioned from niche eco-upgrades to essential criteria in luxury property markets.</p><p>High-end home buyers are prioritizing properties with geothermal heat pumps, smart home systems, solar arrays, and energy-efficient insulation. Beyond reducing carbon footprints, these technologies lower operational expenses and provide backup power options.</p><p>Appraisers report that homes with verified eco-certifications command a premium price and sell faster than properties with traditional mechanical systems.</p>",
        "premium": false
    },
    {
        "title": "Commercial Real Estate: The Loft Conversion Opportunity",
        "excerpt": "Changing work patterns have left commercial office buildings in urban centers underutilized. To address this, developers and municipal governments are exploring loft conversions.",
        "category": "Investment",
        "author": "Marcus Sterling",
        "date": "1 day ago",
        "readTime": "6 min read",
        "body": "<p>Changing work patterns have left commercial office buildings in urban centers underutilized. To address this, developers and municipal governments are exploring loft conversions.</p><p>Converting offices to residential use faces structural challenges\u2014such as plumbing layouts and lighting requirements. However, cities are offering tax incentives and zoning adjustments to streamline these developments, revitalizing downtown districts.</p>",
        "premium": true
    }
];

// Application State
let state = {
    isDarkMode: false,
    bookmarks: [],
    upvoted: [],
    activeCategory: 'all',
    searchQuery: '',
    sortOrder: 'newest',
    currentArticles: [...localArticles],
    activeArticle: null,
    comments: {}, // ArticleTitle -> Array of comments
    pageViews: 1402,
    adClicks: 87,
    earnings: 128.45,
    customFeeds: [],
    isSubscribed: false
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    loadStateFromStorage();
    setupTheme();
    renderTicker();
    
    // Check if we are on a static compliance page
    const isStaticPage = window.location.pathname.endsWith('about.html') || 
                        window.location.pathname.endsWith('privacy.html') || 
                        window.location.pathname.endsWith('terms.html');
                        
    if (isStaticPage) {
        setupEventListeners();
        updateAnalyticsDisplay(false); // Init display
        return; // Return early, bypassing feed-specific initialization
    }
    
    renderCategories();
    setupEventListeners();
    updateAnalyticsDisplay(false); // Init display
    
    // Parse URL parameters for routing
    const isArticlePage = window.location.pathname.endsWith('article.html');
    const urlParams = new URLSearchParams(window.location.search);
    const artId = urlParams.get('art_id');
    const view = urlParams.get('view');
    const filter = urlParams.get('filter');

    if (filter === 'bookmarks') {
        state.sortOrder = 'bookmarks';
        const sortSelect = document.getElementById('news-sort');
        if (sortSelect) sortSelect.value = 'bookmarks';
    }

    if (isArticlePage) {
        if (artId !== null) {
            const idx = parseInt(artId);
            if (idx >= 0 && idx < localArticles.length) {
                openArticle(localArticles[idx]);
            } else {
                window.location.href = 'index.html';
            }
        } else if (view === 'rss') {
            const savedRssArt = localStorage.getItem('6_haven_quest_active_rss_article');
            const savedRssList = localStorage.getItem('6_haven_quest_rss_articles');
            if (savedRssList) {
                state.currentArticles = JSON.parse(savedRssList);
            }
            if (savedRssArt) {
                openArticle(JSON.parse(savedRssArt));
            } else {
                window.location.href = 'index.html';
            }
        } else if (view === 'about') {
            openAboutPage();
        } else if (view === 'ads') {
            openAdPlacementsPage();
        } else if (view === 'terms') {
            openTermsPage();
        } else {
            window.location.href = 'index.html';
        }
    } else {
        // index.html - Hide detail view and progress bar, show feed view
        const detailView = document.getElementById('article-detail-view');
        if (detailView) detailView.style.display = 'none';
        const feedView = document.getElementById('feed-view');
        if (feedView) feedView.style.display = 'block';
        const progBar = document.getElementById('site-scroll-progress');
        if (progBar) progBar.style.display = 'none';

        // Automatically load default RSS feed on first load
        const defaultRssBtn = document.querySelector('.rss-load-btn');
        if (defaultRssBtn) {
            fetchRSSFeed(defaultRssBtn.dataset.url, defaultRssBtn.dataset.name, true);
        } else {
            renderFeed();
        }
    }
});

// Load state from local storage
function loadStateFromStorage() {
    const savedTheme = localStorage.getItem('6_haven_quest_dark_mode');
    state.isDarkMode = savedTheme === 'true';

    const savedBookmarks = localStorage.getItem('6_haven_quest_bookmarks');
    if (savedBookmarks) {
        state.bookmarks = JSON.parse(savedBookmarks);
    }

    const savedUpvotes = localStorage.getItem('6_haven_quest_upvotes');
    if (savedUpvotes) {
        state.upvoted = JSON.parse(savedUpvotes);
    }

    const savedComments = localStorage.getItem('6_haven_quest_comments');
    if (savedComments) {
        state.comments = JSON.parse(savedComments);
    }

    const savedSub = localStorage.getItem('6_haven_quest_subscribed');
    state.isSubscribed = savedSub === 'true';

    const savedViews = localStorage.getItem('6_haven_quest_pageviews');
    if (savedViews) state.pageViews = parseInt(savedViews);

    const savedClicks = localStorage.getItem('6_haven_quest_adclicks');
    if (savedClicks) state.adClicks = parseInt(savedClicks);

    const savedEarnings = localStorage.getItem('6_haven_quest_earnings');
    if (savedEarnings) state.earnings = parseFloat(savedEarnings);

    // Increment page view on load
    state.pageViews += 1;
    state.earnings += 0.05; // Each page load generates minor simulated ad CPM
    saveStateToStorage();
}

// Save state to storage
function saveStateToStorage() {
    localStorage.setItem('6_haven_quest_dark_mode', state.isDarkMode);
    localStorage.setItem('6_haven_quest_bookmarks', JSON.stringify(state.bookmarks));
    localStorage.setItem('6_haven_quest_upvotes', JSON.stringify(state.upvoted));
    localStorage.setItem('6_haven_quest_comments', JSON.stringify(state.comments));
    localStorage.setItem('6_haven_quest_subscribed', state.isSubscribed);
    localStorage.setItem('6_haven_quest_pageviews', state.pageViews);
    localStorage.setItem('6_haven_quest_adclicks', state.adClicks);
    localStorage.setItem('6_haven_quest_earnings', state.earnings.toFixed(2));
}

// Setup Theme
function setupTheme() {
    if (state.isDarkMode) {
        document.body.classList.add('dark');
        document.getElementById('theme-toggle').innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        document.body.classList.remove('dark');
        document.getElementById('theme-toggle').innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
}

// Toggle Theme
function toggleTheme() {
    state.isDarkMode = !state.isDarkMode;
    setupTheme();
    saveStateToStorage();
    incrementAnalytics(1, 0.10); // Changing theme counts as activity
}

// Render Ticker
function renderTicker() {
    const listEl = document.getElementById('ticker-content-list');
    const items = ["Mortgage rates touch a six-month low, sparking housing market interest", "Metropolitan rental rates adjust as multi-family housing supply expands", "Sustainable architecture features fetch a premium in residential sales", "Commercial office conversions to luxury lofts gain municipal regulatory approvals", "Suburban master-planned communities report high demand from young families"];
    
    listEl.innerHTML = items.map(item => `<div class="ticker-item">${item}</div>`).join('');
    
    // Duplicate items to ensure seamless scrolling loop
    listEl.innerHTML += listEl.innerHTML;
}

// Render Category Tabs
function renderCategories() {
    const container = document.getElementById('category-tabs-container');
    const categories = ['all', ...new Set(localArticles.map(a => a.category))];
    
    container.innerHTML = categories.map(cat => {
        const label = cat === 'all' ? 'All News' : cat;
        const activeClass = state.activeCategory === cat ? 'active' : '';
        return `<button class="tab-btn ${activeClass}" data-category="${cat}">${label}</button>`;
    }).join('');
    
    // Add event listeners to new tabs
    container.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.activeCategory = e.target.dataset.category;
            renderFeed();
        });
    });
}

// Generate Custom SVG Thumbnail Placeholder
function getSvgPlaceholder(category, title) {
    // Simple hash to determine color variance
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
        hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    const primColor = `hsl(${hue}, 70%, 45%)`;
    const secColor = `hsl(${(hue + 40) % 360}, 60%, 60%)`;
    
    return `
        <svg class="card-placeholder-svg" viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="grad-${hue}" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:${primColor};stop-opacity:0.85" />
                    <stop offset="100%" style="stop-color:${secColor};stop-opacity:0.85" />
                </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grad-${hue})" />
            <circle cx="100" cy="80" r="30" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.3" />
            <path d="M 70 80 L 130 80" stroke="#ffffff" stroke-width="1" stroke-opacity="0.2" />
            <text x="10" y="25" fill="#ffffff" font-family="'Courier New', monospace" font-size="10" font-weight="bold" opacity="0.6">${category.toUpperCase()}</text>
            <text x="100" y="145" fill="#ffffff" text-anchor="middle" font-family="system-ui, sans-serif" font-size="9" font-weight="500" opacity="0.8">Interactive News indexing</text>
        </svg>
    `;
}

// Render Main Feed
function renderFeed() {
    const container = document.getElementById('news-feed-container');
    
    // 1. Filter Articles
    let filtered = [...state.currentArticles];
    
    if (state.activeCategory !== 'all') {
        filtered = filtered.filter(a => a.category === state.activeCategory);
    }
    
    if (state.searchQuery.trim() !== '') {
        const q = state.searchQuery.toLowerCase();
        filtered = filtered.filter(a => 
            a.title.toLowerCase().includes(q) || 
            a.excerpt.toLowerCase().includes(q)
        );
    }
    
    if (state.sortOrder === 'bookmarks') {
        filtered = filtered.filter(a => state.bookmarks.includes(a.title));
    }
    
    // 2. Sort Articles
    if (state.sortOrder === 'newest') {
        // Keep defaults
    } else if (state.sortOrder === 'trending') {
        filtered.sort((a,b) => (b.title.length % 5) - (a.title.length % 5));
    }
    
    // Update Bookmark count indicator in nav
    document.getElementById('bookmark-count').innerText = state.bookmarks.length;
    
    // Render Hero (always show first matching or default)
    if (filtered.length > 0) {
        const featured = filtered[0];
        document.getElementById('hero-title').innerText = featured.title;
        document.getElementById('hero-excerpt').innerText = featured.excerpt;
        document.getElementById('hero-author').innerHTML = `<i class="fa-solid fa-user"></i> ${featured.author}`;
        document.getElementById('hero-time').innerHTML = `<i class="fa-solid fa-clock"></i> ${featured.readTime}`;
        
        // Remove click listener and re-add for featured
        const heroBtn = document.getElementById('hero-read-btn');
        const newHeroBtn = heroBtn.cloneNode(true);
        heroBtn.parentNode.replaceChild(newHeroBtn, heroBtn);
        newHeroBtn.addEventListener('click', () => handleArticleClick(featured));
    }
    
    // Render List
    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; border: 1px dashed var(--border-color); border-radius: var(--border-radius); background-color: var(--card-bg);">
                <i class="fa-solid fa-folder-open" style="font-size: 32px; color: var(--text-muted); margin-bottom: 10px;"></i>
                <p style="color: var(--text-muted);">No articles indexed matching the active criteria.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filtered.map((art, idx) => {
        const isBookmarked = state.bookmarks.includes(art.title) ? 'active' : '';
        const isUpvoted = state.upvoted.includes(art.title) ? 'active' : '';
        const upvoteCount = (art.title.length % 27) + (state.upvoted.includes(art.title) ? 1 : 0);
        const premiumBadge = art.premium ? `<span class="premium-label-badge"><i class="fa-solid fa-lock"></i> Premium</span>` : '';
        
        return `
            <div class="news-card" data-index="${idx}">
                <div class="card-img-container">
                    ${getSvgPlaceholder(art.category, art.title)}
                </div>
                <div class="card-body">
                    <span class="card-cat-badge">${art.category} ${premiumBadge}</span>
                    <h3>${art.title}</h3>
                    <p>${art.excerpt}</p>
                    <div class="card-meta">
                        <div class="card-meta-left">
                            <span><i class="fa-solid fa-user"></i> ${art.author}</span>
                            <span><i class="fa-solid fa-clock"></i> ${art.readTime}</span>
                        </div>
                        <div class="engagement-bar">
                            <button class="engage-btn upvote-btn ${isUpvoted}" data-title="${art.title}">
                                <i class="fa-solid fa-thumbs-up"></i> <span>${upvoteCount}</span>
                            </button>
                            <button class="engage-btn bookmark-btn ${isBookmarked}" data-title="${art.title}">
                                <i class="fa-solid fa-bookmark"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Bind click events to card bodies (ignoring buttons)
    container.querySelectorAll('.news-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.engage-btn')) return;
            const index = parseInt(card.dataset.index);
            handleArticleClick(filtered[index]);
        });
    });
    
    // Bind click events to card upvote/bookmark buttons
    container.querySelectorAll('.upvote-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleUpvote(btn.dataset.title);
        });
    });
    
    container.querySelectorAll('.bookmark-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleBookmark(btn.dataset.title);
        });
    });
}

// Handle Click / Navigation to an Article (performs full page reload to article.html)
function handleArticleClick(article) {
    const localIdx = localArticles.findIndex(a => a.title === article.title);
    if (localIdx > -1) {
        window.location.href = 'article.html?art_id=' + localIdx;
    } else {
        localStorage.setItem('6_haven_quest_active_rss_article', JSON.stringify(article));
        window.location.href = 'article.html?view=rss';
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Search input
    const searchEl = document.getElementById('news-search');
    if (searchEl) {
        searchEl.addEventListener('input', (e) => {
            state.searchQuery = e.target.value;
            renderFeed();
        });
    }
    
    // Sort select
    const sortEl = document.getElementById('news-sort');
    if (sortEl) {
        sortEl.addEventListener('change', (e) => {
            state.sortOrder = e.target.value;
            renderFeed();
        });
    }
    
    // Theme toggle
    const themeToggleEl = document.getElementById('theme-toggle');
    if (themeToggleEl) {
        themeToggleEl.addEventListener('click', toggleTheme);
    }
    
    // Detail View back button
    const backBtnEl = document.getElementById('detail-back-btn');
    if (backBtnEl) {
        backBtnEl.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
    
    // Detail View actions
    const bookmarkBtnEl = document.getElementById('detail-bookmark-btn');
    if (bookmarkBtnEl) {
        bookmarkBtnEl.addEventListener('click', () => {
            if (state.activeArticle) {
                toggleBookmark(state.activeArticle.title);
                updateArticleActionButtons();
            }
        });
    }
    
    const upvoteBtnEl = document.getElementById('detail-upvote-btn');
    if (upvoteBtnEl) {
        upvoteBtnEl.addEventListener('click', () => {
            if (state.activeArticle) {
                toggleUpvote(state.activeArticle.title);
                updateArticleActionButtons();
            }
        });
    }
    
    // Comment Submission
    const commentFormEl = document.getElementById('detail-comment-form');
    if (commentFormEl) {
        commentFormEl.addEventListener('submit', handleCommentSubmit);
    }
    
    // Newsletter Submission
    const newsletterFormEl = document.getElementById('newsletter-form');
    if (newsletterFormEl) {
        newsletterFormEl.addEventListener('submit', handleNewsletterSubmit);
    }
    
    // Workspace calculation trigger
    const calcBtn = document.getElementById('run-calc');
    if (calcBtn) {
        calcBtn.addEventListener('click', runWorkspaceCalculator);
    }
    
    // Bookmark Nav filter link (performs page reload for bookmarks view)
    const bookmarkNavEl = document.getElementById('bookmark-nav');
    if (bookmarkNavEl) {
        bookmarkNavEl.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'index.html?filter=bookmarks';
        });
    }
    
    // Home Nav reset link (performs full reload)
    const homeNavEl = document.querySelector('#main-nav a');
    if (homeNavEl) {
        homeNavEl.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'index.html';
        });
    }

    // Brand Logo click
    const logoEl = document.getElementById('brand-logo');
    if (logoEl) {
        logoEl.style.cursor = 'pointer';
        logoEl.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    // RSS Nav click
    const rssNav = document.getElementById('rss-nav');
    if (rssNav) {
        rssNav.addEventListener('click', (e) => {
            e.preventDefault();
            const widget = document.querySelector('.rss-sources-widget');
            if (widget) {
                widget.scrollIntoView({ behavior: 'smooth' });
                widget.style.outline = '2px solid var(--primary)';
                setTimeout(() => widget.style.outline = 'none', 1500);
            }
        });
    }
    
    // Ad spot clicks
    document.querySelectorAll('.ad-unit').forEach(ad => {
        ad.addEventListener('click', () => {
            alert('Simulating ad click redirection.');
            incrementAnalytics(10, 2.50);
        });
    });
    
    // RSS Loader configuration
    document.querySelectorAll('.rss-load-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            fetchRSSFeed(btn.dataset.url, btn.dataset.name, false);
        });
    });
    
    const loadCustomRssEl = document.getElementById('load-custom-rss');
    if (loadCustomRssEl) {
        loadCustomRssEl.addEventListener('click', () => {
            const urlInput = document.getElementById('custom-rss-url');
            if (urlInput && urlInput.value.trim() !== '') {
                fetchRSSFeed(urlInput.value, 'Custom RSS Resource', false);
            }
        });
    }
    
    const cancelRssBtnEl = document.getElementById('cancel-rss-btn');
    if (cancelRssBtnEl) {
        cancelRssBtnEl.addEventListener('click', () => {
            state.currentArticles = [...localArticles];
            const statusBar = document.getElementById('rss-status-bar');
            if (statusBar) statusBar.style.display = 'none';
            renderFeed();
        });
    }

    // Window scroll progress listener for reading indicator
    window.addEventListener('scroll', () => {
        const detailView = document.getElementById('article-detail-view');
        if (detailView && detailView.style.display === 'block') {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0;
            const bar = document.getElementById('scroll-progress-bar');
            if (bar) bar.style.width = `${scrollPercent}%`;
        }
    });
}

// Toggle Bookmarking
function toggleBookmark(title) {
    const idx = state.bookmarks.indexOf(title);
    if (idx > -1) {
        state.bookmarks.splice(idx, 1);
    } else {
        state.bookmarks.push(title);
        incrementAnalytics(1, 0.25);
    }
    saveStateToStorage();
    renderFeed();
}

// Toggle Upvote
function toggleUpvote(title) {
    const idx = state.upvoted.indexOf(title);
    if (idx > -1) {
        state.upvoted.splice(idx, 1);
    } else {
        state.upvoted.push(title);
        incrementAnalytics(1, 0.40);
    }
    saveStateToStorage();
    renderFeed();
}

// Open Article in Detail View
function openArticle(article) {
    state.activeArticle = article;
    
    // Hide Feed View, Show Detail View
    document.getElementById('feed-view').style.display = 'none';
    document.getElementById('article-detail-view').style.display = 'block';
    
    document.getElementById('detail-category').innerText = article.category;
    document.getElementById('detail-title').innerText = article.title;
    document.getElementById('detail-author').innerText = article.author;
    document.getElementById('detail-read-time').innerText = article.readTime;
    document.getElementById('detail-date').innerText = article.date;
    document.getElementById('detail-body-content').innerHTML = article.body;
    
    // Show and Reset scroll progress bar
    document.getElementById('site-scroll-progress').style.display = 'block';
    document.getElementById('scroll-progress-bar').style.width = '0%';
    
    updateArticleActionButtons();
    renderComments();
    renderRelatedArticles(article);
    
    // Reset scroll position to top of window
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    incrementAnalytics(1, 0.15); // Viewing article increases pageviews
}

// Render 7 related articles (prioritizing same category, with slide hover animations)
function renderRelatedArticles(article) {
    const listEl = document.getElementById('detail-related-list');
    if (!listEl) return;
    
    // Filter out active article
    let candidates = state.currentArticles.filter(a => a.title !== article.title);
    
    // Sort candidates: same category first
    candidates.sort((a, b) => {
        if (a.category === article.category && b.category !== article.category) return -1;
        if (a.category !== article.category && b.category === article.category) return 1;
        return 0;
    });
    
    // Pick top 7
    const related = candidates.slice(0, 7);
    
    if (related.length === 0) {
        listEl.innerHTML = `<p style="color: var(--text-muted); font-style: italic; font-size: 13px; padding: 10px 0;">No related articles found.</p>`;
        return;
    }
    
    listEl.innerHTML = related.map((art) => {
        return `
            <div class="related-article-item" style="display: flex; gap: 15px; padding: 12px; border: 1px solid var(--border-color); border-radius: var(--border-radius); background-color: var(--card-bg); cursor: pointer; transition: all var(--transition-speed) ease; align-items: center;" data-title="${art.title}">
                <div style="flex-shrink: 0; width: 60px; height: 45px; border-radius: 4px; overflow: hidden;">
                    ${getSvgPlaceholder(art.category, art.title)}
                </div>
                <div style="flex-grow: 1;">
                    <span style="font-size: 10px; font-weight: 700; color: var(--primary); text-transform: uppercase;">${art.category}</span>
                    <h4 style="margin: 2px 0 4px 0; font-size: 14px; line-height: 1.4; color: var(--text-color); font-weight: 600;">${art.title}</h4>
                    <div style="font-size: 11px; color: var(--text-muted); display: flex; gap: 10px;">
                        <span><i class="fa-solid fa-user"></i> ${art.author}</span>
                        <span><i class="fa-solid fa-clock"></i> ${art.readTime}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Bind click handlers
    listEl.querySelectorAll('.related-article-item').forEach(item => {
        item.addEventListener('click', () => {
            const title = item.dataset.title;
            const targetArt = state.currentArticles.find(a => a.title === title);
            if (targetArt) {
                handleArticleClick(targetArt);
            }
        });
        item.addEventListener('mouseenter', () => {
            item.style.borderColor = 'var(--primary)';
            item.style.transform = 'translateX(4px)';
            item.style.backgroundColor = 'rgba(var(--primary-rgb), 0.02)';
        });
        item.addEventListener('mouseleave', () => {
            item.style.borderColor = 'var(--border-color)';
            item.style.transform = 'translateX(0)';
            item.style.backgroundColor = 'var(--card-bg)';
        });
    });
}

// Update Article Bookmark/Upvote Buttons UI
function updateArticleActionButtons() {
    if (!state.activeArticle) return;
    
    const upBtn = document.getElementById('detail-upvote-btn');
    const bookBtn = document.getElementById('detail-bookmark-btn');
    const isUpvoted = state.upvoted.includes(state.activeArticle.title);
    const isBookmarked = state.bookmarks.includes(state.activeArticle.title);
    
    const baseCount = (state.activeArticle.title.length % 27);
    const upvoteCount = baseCount + (isUpvoted ? 1 : 0);
    
    upBtn.innerHTML = `<i class="fa-solid fa-thumbs-up"></i> Upvoted (${upvoteCount})`;
    if (isUpvoted) upBtn.classList.add('active'); else upBtn.classList.remove('active');
    
    bookBtn.innerHTML = isBookmarked ? `<i class="fa-solid fa-bookmark"></i> Bookmarked` : `<i class="fa-solid fa-bookmark"></i> Bookmark`;
    if (isBookmarked) bookBtn.classList.add('active'); else bookBtn.classList.remove('active');
}

// Render comments for active article
function renderComments() {
    if (!state.activeArticle) return;
    const title = state.activeArticle.title;
    const comments = state.comments[title] || [];
    
    const countEl = document.getElementById('detail-comments-count');
    const listEl = document.getElementById('detail-comments-list');
    
    countEl.innerText = comments.length;
    
    if (comments.length === 0) {
        listEl.innerHTML = `<p style="text-align:center; color:var(--text-muted); font-style:italic; font-size:13px; margin: 15px 0;">No comments yet. Start the conversation!</p>`;
        return;
    }
    
    listEl.innerHTML = comments.map(c => `
        <div class="comment-item">
            <div class="comment-meta">
                <span class="comment-author"><i class="fa-solid fa-user-circle"></i> ${c.author}</span>
                <span>${c.date}</span>
            </div>
            <div class="comment-text">${c.text}</div>
        </div>
    `).join('');
}

// Handle Comment submission
function handleCommentSubmit(e) {
    e.preventDefault();
    if (!state.activeArticle) return;
    
    const textEl = document.getElementById('detail-comment-text');
    const text = textEl.value.trim();
    if (text === '') return;
    
    const title = state.activeArticle.title;
    if (!state.comments[title]) state.comments[title] = [];
    
    state.comments[title].push({
        author: 'Guest Analyst',
        date: 'Just now',
        text: text
    });
    
    textEl.value = '';
    saveStateToStorage();
    renderComments();
    incrementAnalytics(2, 0.75);
}

// Handle Newsletter Form Subscription
function handleNewsletterSubmit(e) {
    e.preventDefault();
    const emailInput = document.getElementById('news-email');
    const email = emailInput.value.trim();
    if (email === '') return;
    
    const container = document.getElementById('newsletter-form-container');
    container.innerHTML = `
        <div style="text-align: center; padding: 15px; border: 1px solid var(--primary); border-radius: var(--border-radius); background-color: rgba(var(--primary-rgb), 0.05);">
            <i class="fa-solid fa-circle-check" style="font-size:28px; color: var(--primary); margin-bottom: 8px;"></i>
            <h5 style="margin:0 0 5px 0;">Subscription Confirmed</h5>
            <p style="font-size:12px; color:var(--text-muted); margin:0;">Email <strong>${email}</strong> registered for briefings.</p>
        </div>
    `;
    state.isSubscribed = true;
    saveStateToStorage();
    incrementAnalytics(15, 5.00);
}

// Run Workspace calculations
function runWorkspaceCalculator() {
    const resultEl = document.getElementById('calc-results');
    
            const price = parseFloat(document.getElementById('home-price').value) || 0;
            const down = parseFloat(document.getElementById('down-payment').value) || 0;
            const rate = parseFloat(document.getElementById('mort-rate').value) / 100 || 0.05;
            const term = parseInt(document.getElementById('loan-term').value) || 30;
            
            const principal = price - down;
            const monthlyRate = rate / 12;
            const totalMonths = term * 12;
            
            let monthlyPI = 0;
            if (monthlyRate === 0) {
                monthlyPI = principal / totalMonths;
            } else {
                monthlyPI = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                            (Math.pow(1 + monthlyRate, totalMonths) - 1);
            }
            
            resultEl.innerHTML = `
                <div class="calc-result-box" style="border-left: 4px solid var(--primary); padding-left: 10px; margin-top: 15px;">
                    <h5 style="margin: 0 0 5px 0;">Estimated Monthly P&I:</h5>
                    <div style="font-size: 24px; font-weight: bold; color: var(--primary);">$${Math.round(monthlyPI).toLocaleString()}<span style="font-size: 14px; font-weight: normal; color: var(--text-color);"> / mo</span></div>
                    <div style="font-size: 11px; margin-top: 5px; opacity: 0.8;">Financed Amount: <strong>$${Math.round(principal).toLocaleString()}</strong></div>
                    <p style="font-size: 10px; margin: 8px 0 0 0; opacity: 0.7; font-style: italic;">*Does not include property taxes, home insurance, or private mortgage insurance (PMI).</p>
                </div>
            `;
        
    incrementAnalytics(5, 1.20);
}

// Parse and Load RSS Feed via allorigins CORS proxy
function fetchRSSFeed(url, name, isAutoLoad = false) {
    const statusBar = document.getElementById('rss-status-bar');
    const sourceLabel = document.getElementById('rss-source-name');
    
    statusBar.style.display = 'flex';
    sourceLabel.innerText = name;
    statusBar.querySelector('.rss-status-message').innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Fetching active RSS feed from <strong>${name}</strong>...`;
    
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    
    fetch(proxyUrl)
        .then(response => {
            if (!response.ok) throw new Error('CORS network query failed');
            return response.text();
        })
        .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
        .then(data => {
            const items = data.querySelectorAll("item");
            if (items.length === 0) throw new Error("No XML items parsed");
            
            const parsedArticles = [];
            items.forEach((el, idx) => {
                if (idx >= 8) return;
                
                const title = el.querySelector("title")?.textContent || "Untitled Aggregate Article";
                const link = el.querySelector("link")?.textContent || "#";
                
                let description = el.querySelector("description")?.textContent || "No summary provided by the aggregator feed.";
                description = description.replace(/<[^>]*>/g, '').substring(0, 160) + '...';
                
                const pubDate = el.querySelector("pubDate")?.textContent || "Recently";
                
                // Dynamically calculate read time based on word count
                const wordCount = description.split(/\s+/).filter(w => w.length > 0).length;
                const readTimeMin = Math.max(1, Math.ceil(wordCount / 180));
                const dynamicReadTime = `${readTimeMin} min read`;
                
                parsedArticles.push({
                    title: title,
                    excerpt: description,
                    category: 'Live Feed',
                    author: name.split(' ')[0] + ' RSS',
                    date: parseDateAgo(pubDate),
                    readTime: dynamicReadTime,
                    body: `<p>${description}</p><p>This article is aggregated from an active RSS resource. You can view the original article structure on the publisher's site.</p><a href="${link}" target="_blank" class="hero-btn" style="display:inline-block; margin-top:10px;">Read Original Source <i class="fa-solid fa-external-link"></i></a>`
                });
            });
            
            state.currentArticles = parsedArticles;
            localStorage.setItem('6_haven_quest_rss_articles', JSON.stringify(parsedArticles));
            statusBar.querySelector('.rss-status-message').innerHTML = `<i class="fa-solid fa-circle-check" style="color:var(--primary);"></i> Loaded <strong>${parsedArticles.length}</strong> live articles from <strong>${name}</strong>.`;
            renderFeed();
            if (!isAutoLoad) incrementAnalytics(20, 3.50);
            
            // Auto hide status bar after 5 seconds on auto-load success
            if (isAutoLoad) {
                setTimeout(() => {
                    statusBar.style.display = 'none';
                }, 5000);
            }
        })
        .catch(err => {
            console.error(err);
            statusBar.querySelector('.rss-status-message').innerHTML = `<i class="fa-solid fa-circle-exclamation" style="color:var(--accent);"></i> Aggregator offline. Using local simulated database.`;
            state.currentArticles = [...localArticles];
            renderFeed();
            if (isAutoLoad) {
                setTimeout(() => {
                    statusBar.style.display = 'none';
                }, 5000);
            }
        });
}

// Helper: Convert pubDate string to relative text
function parseDateAgo(dateStr) {
    try {
        const pub = new Date(dateStr);
        const diff = new Date() - pub;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours <= 0) return 'Just now';
        if (hours < 24) return `${hours} hours ago`;
        return `${Math.floor(hours/24)} days ago`;
    } catch(e) {
        return 'Recently';
    }
}

// Increment and Update ad analytics tracker
function incrementAnalytics(views, cash) {
    state.pageViews += views;
    state.earnings += cash;
    updateAnalyticsDisplay(true);
    saveStateToStorage();
}

// Update Analytics UI Display
function updateAnalyticsDisplay(animate) {
    const viewsEl = document.getElementById('analytics-pageviews');
    const earningsEl = document.getElementById('analytics-earnings');
    
    if (viewsEl && earningsEl) {
        viewsEl.innerText = state.pageViews.toLocaleString();
        earningsEl.innerText = `$${state.earnings.toFixed(2)}`;
        
        if (animate) {
            viewsEl.style.transform = 'scale(1.1)';
            earningsEl.style.transform = 'scale(1.1)';
            setTimeout(() => {
                viewsEl.style.transform = 'scale(1)';
                earningsEl.style.transform = 'scale(1)';
            }, 200);
        }
    }
}
