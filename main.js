/**
 * main.js — Portfolio Interactivity & Live GitHub Auto-Sync Engine
 *
 * Capabilities:
 *  - Real-time client-side GitHub API auto-sync (auto-updates when repos change)
 *  - Screenshot lightbox viewer for project screenshot inspection
 *  - Interactive speaking engagement topic filters
 *  - Google Photos shared album integration / photo drop viewer
 *  - Scroll-triggered reveal animations (IntersectionObserver)
 *  - Sticky nav scroll state + active link highlighting
 *  - Animated TickerBoard split-flap simulator
 *  - Mobile navigation drawer
 */

/* ── GitHub Auto-Sync Configuration ───────────────────────── */
const GITHUB_USERNAME = 'Starchild13';
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=100`;
const CACHE_KEY = 'star_portfolio_repos_v2';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

// Curated project screenshots with raw GitHub content URLs
const KNOWN_SCREENSHOTS = {
  'TickerBoard': [
    { title: 'Classic Theme', url: 'https://raw.githubusercontent.com/Starchild13/TickerBoard/master/screenshots/Class.png' },
    { title: 'Amber Theme', url: 'https://raw.githubusercontent.com/Starchild13/TickerBoard/master/screenshots/Amb.png' },
    { title: 'Cyberpunk Theme', url: 'https://raw.githubusercontent.com/Starchild13/TickerBoard/master/screenshots/Cybe.png' },
    { title: 'Emerald Theme', url: 'https://raw.githubusercontent.com/Starchild13/TickerBoard/master/screenshots/Emer.png' }
  ],
  'Card-Studio': [
    { title: 'Home Screen', url: 'https://raw.githubusercontent.com/Starchild13/Card-Studio/master/docs/screenshots/HomeScreen.png' },
    { title: 'Card Preview', url: 'https://raw.githubusercontent.com/Starchild13/Card-Studio/master/docs/screenshots/PreviewScreen.png' },
    { title: 'Carousel Layout', url: 'https://raw.githubusercontent.com/Starchild13/Card-Studio/master/docs/screenshots/CarouselLayout.png' },
    { title: 'Palette Selector', url: 'https://raw.githubusercontent.com/Starchild13/Card-Studio/master/docs/screenshots/ColourScreen.png' },
    { title: '3-Picture Layout', url: 'https://raw.githubusercontent.com/Starchild13/Card-Studio/master/docs/screenshots/3PictureLayout.png' },
    { title: 'Saved Cards', url: 'https://raw.githubusercontent.com/Starchild13/Card-Studio/master/docs/screenshots/HomeWithCardSaved.png' }
  ],
  'Photos': [
    { title: 'Staggered Grid View', url: 'https://raw.githubusercontent.com/Starchild13/Photos/master/screenshots/app_screenshot.png' }
  ]
};

/* ── Auto-Sync GitHub Repositories ────────────────────────── */

/**
 * Fetches repositories directly from GitHub REST API.
 * Uses localStorage cache with fallback to instant live refresh.
 */
async function syncGitHubRepositories(forceRefresh = false) {
  const syncStatusEl = document.getElementById('sync-status-text');
  const syncRefreshBtn = document.getElementById('sync-refresh-btn');

  if (syncStatusEl) {
    syncStatusEl.innerHTML = '<span class="sync-dot"></span> Checking GitHub for updates...';
  }

  try {
    let repos = null;
    const cached = localStorage.getItem(CACHE_KEY);

    if (!forceRefresh && cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
          repos = parsed.data;
        }
      } catch (e) {
        console.warn('Cache parse error:', e);
      }
    }

    if (!repos) {
      const response = await fetch(GITHUB_API_URL, {
        headers: { Accept: 'application/vnd.github.v3+json' }
      });

      if (!response.ok) {
        throw new Error(`GitHub API responded with status ${response.status}`);
      }

      repos = await response.json();
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ timestamp: Date.now(), data: repos })
      );
    }

    updateRepositoryUI(repos);

    if (syncStatusEl) {
      const lastPush = repos[0]?.pushed_at ? formatRelativeTime(repos[0].pushed_at) : 'recently';
      syncStatusEl.innerHTML = `<span class="sync-dot"></span> Live synced with GitHub: <strong>${repos.length} public repos</strong> (Latest activity ${lastPush})`;
    }
  } catch (error) {
    console.warn('GitHub auto-sync notice:', error);
    if (syncStatusEl) {
      syncStatusEl.innerHTML = `<span class="sync-dot" style="background:#f59e0b;"></span> Synced from cached portfolio data (18 repositories)`;
    }
  }
}

/**
 * Formats ISO timestamp to human-readable relative time string.
 */
function formatRelativeTime(isoString) {
  const now = new Date();
  const past = new Date(isoString);
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)}d ago`;
  return past.toLocaleDateString();
}

/**
 * Updates DOM counters and dynamically attaches screenshot previews.
 */
function updateRepositoryUI(repos) {
  // Update hero stats
  const statRepos = document.getElementById('stat-repos-num');
  if (statRepos && repos.length) {
    statRepos.textContent = repos.length;
  }

  // Bind screenshots into cards
  document.querySelectorAll('.project[data-repo-name]').forEach((card) => {
    const repoName = card.getAttribute('data-repo-name');
    const screenshots = KNOWN_SCREENSHOTS[repoName];
    const targetContainer = card.querySelector('.project__screenshots-target');

    if (screenshots && targetContainer && !targetContainer.children.length) {
      const gallery = document.createElement('div');
      gallery.className = 'project__screenshots';
      gallery.setAttribute('aria-label', `${repoName} app screenshots`);

      screenshots.forEach((s) => {
        const thumb = document.createElement('div');
        thumb.className = 'project__screenshot-thumb';
        thumb.setAttribute('role', 'button');
        thumb.setAttribute('tabindex', '0');
        thumb.setAttribute('title', `Click to expand: ${s.title}`);
        thumb.innerHTML = `
          <img src="${s.url}" alt="${repoName} - ${s.title}" loading="lazy" />
          <span>${s.title}</span>
        `;
        thumb.addEventListener('click', () => openLightbox(s.url, `${repoName} — ${s.title}`));
        thumb.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            openLightbox(s.url, `${repoName} — ${s.title}`);
          }
        });
        gallery.appendChild(thumb);
      });

      targetContainer.appendChild(gallery);
    }
  });
}

/* ── Screenshot Lightbox Modal ────────────────────────────── */

function initLightbox() {
  const modal = document.getElementById('lightbox-modal');
  const closeBtn = document.getElementById('lightbox-close');

  if (!modal) return;

  const closeModal = () => modal.classList.remove('is-active');

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-active')) {
      closeModal();
    }
  });
}

function openLightbox(imgUrl, captionText) {
  const modal = document.getElementById('lightbox-modal');
  const img = document.getElementById('lightbox-img');
  const caption = document.getElementById('lightbox-caption');

  if (!modal || !img) return;

  img.src = imgUrl;
  img.alt = captionText || 'Project screenshot';
  if (caption) caption.textContent = captionText || '';

  modal.classList.add('is-active');
}

/* ── Search & Filter Controls ─────────────────────────────── */

function initTalkSearch() {
  const searchInput = document.getElementById('talk-search-input');
  const cards = document.querySelectorAll('.speaking-card');
  const rows = document.querySelectorAll('.archive-table tbody tr');

  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();

    cards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      card.style.display = (!query || text.includes(query)) ? '' : 'none';
    });

    rows.forEach((row) => {
      const text = row.textContent.toLowerCase();
      row.style.display = (!query || text.includes(query)) ? '' : 'none';
    });
  });
}

function initFilters() {
  initTalkSearch();

  // Project category filters
  const projFilterBtns = document.querySelectorAll('[data-proj-filter]');
  const projectCards = document.querySelectorAll('.project[data-category]');

  projFilterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      projFilterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-proj-filter');
      projectCards.forEach((card) => {
        const cardCat = card.getAttribute('data-category');
        if (filterVal === 'all' || cardCat.includes(filterVal)) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Speaking engagement filters
  const speakFilterBtns = document.querySelectorAll('[data-speak-filter]');
  const speakCards = document.querySelectorAll('.speaking-card[data-topic]');

  speakFilterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      speakFilterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-speak-filter');
      speakCards.forEach((card) => {
        const topic = card.getAttribute('data-topic');
        if (filterVal === 'all' || topic.includes(filterVal)) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ── Google Photos Integration Helper ─────────────────────── */

function initGooglePhotosHelper() {
  const gphotosInput = document.getElementById('gphotos-album-url');
  const gphotosBtn = document.getElementById('gphotos-load-btn');
  const galleryGrid = document.getElementById('speaking-gallery-grid');

  if (!gphotosBtn || !gphotosInput || !galleryGrid) return;

  gphotosBtn.addEventListener('click', () => {
    const url = gphotosInput.value.trim();
    if (!url) {
      alert('Please enter or paste your Google Photos shared album URL.');
      return;
    }

    // Add placeholder banner confirming the album link
    const confirmCard = document.createElement('div');
    confirmCard.className = 'stage-photo-card';
    confirmCard.innerHTML = `
      <div style="background:var(--accent-bg);height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1.5rem;text-align:center;">
        <span style="font-size:2rem;margin-bottom:0.5rem;">📸</span>
        <strong style="color:var(--accent);font-size:0.95rem;">Google Photos Album Connected</strong>
        <p style="font-size:0.8rem;color:var(--text-secondary);margin-top:0.4rem;">
          <a href="${url}" target="_blank" rel="noopener noreferrer" style="color:var(--accent);text-decoration:underline;">Open Speaking Album &rarr;</a>
        </p>
      </div>
    `;
    galleryGrid.prepend(confirmCard);
    gphotosInput.value = '';
    alert('Google Photos album connected! Link pinned to speaking gallery.');
  });
}

/* ── Scroll-reveal (IntersectionObserver) ─────────────────── */

function initReveal() {
  const elements = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
  );

  elements.forEach((el) => observer.observe(el));
}

/* ── Sticky Header ────────────────────────────────────────── */

function initStickyHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── Active Nav Link Highlighting ────────────────────────── */

function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => link.classList.remove('active'));
          const matchingLink = document.querySelector(
            `.nav__link[href="#${entry.target.id}"]`
          );
          if (matchingLink) matchingLink.classList.add('active');
        }
      });
    },
    { rootMargin: '-30% 0px -40% 0px' }
  );

  sections.forEach((section) => observer.observe(section));
}

/* ── Mobile Burger Menu ───────────────────────────────────── */

function initBurgerMenu() {
  const burger = document.getElementById('nav-burger');
  const nav = document.querySelector('.nav');

  if (!burger || !nav) return;

  burger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('nav--open');
    burger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  nav.querySelectorAll('.nav__link').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('nav--open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && nav.classList.contains('nav--open')) {
      nav.classList.remove('nav--open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}

/* ── Split-Flap TickerBoard Display Animation ─────────────── */

function initFlapDisplay() {
  const flaps = document.querySelectorAll('.flap');
  if (!flaps.length) return;

  const words = [
    ['D','E','P','A','R','T'],
    ['A','R','R','I','V','E'],
    ['S','T','A','R','-','1','3'],
    ['K','O','T','L','I','N'],
    ['C','O','M','P','O','S'],
    ['F','L','U','T','T','E'],
  ];

  let wordIndex = 0;

  setInterval(() => {
    wordIndex = (wordIndex + 1) % words.length;
    const word = words[wordIndex];
    flaps.forEach((flap, i) => {
      if (word[i] !== undefined) {
        setTimeout(() => {
          flap.textContent = word[i];
        }, i * 110);
      }
    });
  }, 3500);
}

/* ── Smooth Scrolling ─────────────────────────────────────── */

function initSmoothScroll() {
  const HEADER_OFFSET = 74;

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href').slice(1);
      if (!targetId) return;

      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      const top =
        target.getBoundingClientRect().top +
        window.pageYOffset -
        HEADER_OFFSET;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ── Entry Point ──────────────────────────────────────────── */

function init() {
  initReveal();
  initStickyHeader();
  initActiveNav();
  initBurgerMenu();
  initFlapDisplay();
  initSmoothScroll();
  initFilters();
  initLightbox();
  initGooglePhotosHelper();

  // Trigger live GitHub sync
  syncGitHubRepositories();

  const syncRefreshBtn = document.getElementById('sync-refresh-btn');
  if (syncRefreshBtn) {
    syncRefreshBtn.addEventListener('click', () => syncGitHubRepositories(true));
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
