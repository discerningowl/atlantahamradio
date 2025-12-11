// Common header component for all pages
function loadHeader() {
    // Detect if we're in a subdirectory (pages/)
    const isInSubdir = window.location.pathname.includes('/pages/');
    const pathPrefix = isInSubdir ? '../' : '';

    const headerHTML = `
        <header class="header">
            <div class="header-content">
                <a href="${pathPrefix}index.html" class="logo">
                    <img src="${pathPrefix}images/logo.png" alt="Atlanta Ham Radio Logo" class="logo-image">
                    <div class="logo-text">
                        <h1>Atlanta Ham Radio</h1>
                        <p>Connecting Operators to Community</p>
                    </div>
                </a>
                <nav id="desktopNav">
                    <a href="${pathPrefix}index.html#calendar">Calendar</a>
                    <a href="${pathPrefix}pages/clubs.html">Clubs</a>
                    <a href="${pathPrefix}pages/organizers.html">For Organizers</a>
                    <a href="${pathPrefix}pages/getstarted.html">Get Started</a>
                    <a href="${pathPrefix}pages/resources.html">Resources</a>
                    <a href="${pathPrefix}pages/about.html">About</a>
                    <button id="themeToggle" aria-label="Toggle theme" style="background: none; border: none; color: inherit; cursor: pointer; padding: 0.5rem; display: flex; align-items: center;">
                        <svg id="sunIcon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>
                        <svg id="moonIcon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                    </button>
                </nav>
                <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Toggle mobile menu">
                    <svg class="hamburger-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
                    <svg class="close-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
            </div>
            <nav class="mobile-nav" id="mobileNav">
                <a href="${pathPrefix}index.html#calendar">Calendar</a>
                <a href="${pathPrefix}pages/clubs.html">Clubs</a>
                <a href="${pathPrefix}pages/organizers.html">For Organizers</a>
                <a href="${pathPrefix}pages/getstarted.html">Get Started</a>
                <a href="${pathPrefix}pages/resources.html">Resources</a>
                <a href="${pathPrefix}pages/about.html">About</a>
                <button id="themeToggleMobile" aria-label="Toggle theme" style="background: var(--bg-card); border: 1px solid var(--border-primary); border-bottom: 1px solid var(--border-primary); color: inherit; cursor: pointer; padding: 1.25rem 2rem; width: 100%; text-align: center; min-height: 60px; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-size: 1.5rem; font-weight: 600;">
                    <svg id="sunIconMobile" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>
                    <svg id="moonIconMobile" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                    <span id="themeToggleText">Light Mode</span>
                </button>
            </nav>
        </header>
    `;

    document.body.insertAdjacentHTML('afterbegin', headerHTML);

    // Add back to top button
    const backToTopHTML = `
        <button class="back-to-top" id="backToTop" aria-label="Back to top">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m18 15-6-6-6 6"/>
            </svg>
        </button>
    `;
    document.body.insertAdjacentHTML('beforeend', backToTopHTML);

    // Initialize mobile menu, theme toggle, and back to top after DOM insertion
    initMobileMenu();
    initThemeToggle();
    initBackToTop();
}

// Mobile menu functionality
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');
    const hamburgerIcon = mobileMenuBtn?.querySelector('.hamburger-icon');
    const closeIcon = mobileMenuBtn?.querySelector('.close-icon');

    if (!mobileMenuBtn || !mobileNav) return;

    mobileMenuBtn.addEventListener('click', () => {
        const isOpen = mobileNav.classList.toggle('active');

        // Toggle icons
        if (hamburgerIcon && closeIcon) {
            hamburgerIcon.style.display = isOpen ? 'none' : 'block';
            closeIcon.style.display = isOpen ? 'block' : 'none';
        }

        // Prevent body scroll when menu is open
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close mobile menu when clicking on a link
    const mobileNavLinks = mobileNav.querySelectorAll('a');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('active');
            if (hamburgerIcon && closeIcon) {
                hamburgerIcon.style.display = 'block';
                closeIcon.style.display = 'none';
            }
            document.body.style.overflow = '';
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mobileMenuBtn.contains(e.target) && !mobileNav.contains(e.target)) {
            if (mobileNav.classList.contains('active')) {
                mobileNav.classList.remove('active');
                if (hamburgerIcon && closeIcon) {
                    hamburgerIcon.style.display = 'block';
                    closeIcon.style.display = 'none';
                }
                document.body.style.overflow = '';
            }
        }
    });
}

// Theme toggle functionality
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeToggleMobile = document.getElementById('themeToggleMobile');
    const sunIcon = document.getElementById('sunIcon');
    const moonIcon = document.getElementById('moonIcon');
    const sunIconMobile = document.getElementById('sunIconMobile');
    const moonIconMobile = document.getElementById('moonIconMobile');
    const themeToggleText = document.getElementById('themeToggleText');

    // Function to update theme icons and text
    function updateThemeUI(theme) {
        if (theme === 'dark') {
            // Show moon icon (dark mode active)
            if (sunIcon) sunIcon.style.display = 'none';
            if (moonIcon) moonIcon.style.display = 'block';
            if (sunIconMobile) sunIconMobile.style.display = 'none';
            if (moonIconMobile) moonIconMobile.style.display = 'block';
            if (themeToggleText) themeToggleText.textContent = 'Dark Mode';
        } else {
            // Show sun icon (light mode active)
            if (sunIcon) sunIcon.style.display = 'block';
            if (moonIcon) moonIcon.style.display = 'none';
            if (sunIconMobile) sunIconMobile.style.display = 'block';
            if (moonIconMobile) moonIconMobile.style.display = 'none';
            if (themeToggleText) themeToggleText.textContent = 'Light Mode';
        }
    }

    // Function to set theme
    function setTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
        updateThemeUI(theme);
    }

    // Function to toggle theme
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    }

    // Add click listeners to both toggle buttons
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    if (themeToggleMobile) {
        themeToggleMobile.addEventListener('click', toggleTheme);
    }

    // Set initial UI state based on current theme
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    updateThemeUI(currentTheme);
}

// Back to top button functionality
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');

    if (!backToTopBtn) return;

    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    // Scroll to top when clicked
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Initialize theme on page load (before header loads)
function initializeTheme() {
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
        // Use saved preference
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
}

// YouTube button component - can be called from pages that need it
function loadYouTubeButton() {
    const youTubeButtonHTML = `
        <h3 style="text-align: center; margin-bottom: 1.5rem; color: var(--text-primary);">📺 Video Resources</h3>
        <div class="youtube-container">
            <a href="https://www.youtube.com/@AtlantaHamRadio" target="_blank" class="btn btn-youtube">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                Atlanta Ham Radio YouTube
            </a>
            <p class="youtube-text">Watch tutorials, event discussions, and learn about what's going with amateur radio public service.</p>
        </div>
    `;
    return youTubeButtonHTML;
}

// Google Drive button component - can be called from pages that need it
function loadGoogleDriveButton() {
    const googleDriveButtonHTML = `
        <h3 style="text-align: center; margin-bottom: 1.5rem; color: var(--text-primary);">📁 Event Planning Resources</h3>
        <div class="youtube-container">
            <a href="https://drive.google.com/drive/folders/1AIxwT9E0L86JFTE3RXHyKeye2kpDAvPN?usp=drive_link" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 0.5rem;">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
                View Google Drive Resources
            </a>
            <p class="youtube-text">Access helpful documents and templates to get you started in building a communications event plan as a Net Control Station (NCS).</p>
        </div>
    `;
    return googleDriveButtonHTML;
}

// Initialize theme immediately (before DOM loads to prevent flash)
initializeTheme();

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    // Only update if user hasn't set a manual preference
    if (!localStorage.getItem('theme')) {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
});

// Load header when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHeader);
} else {
    loadHeader();
}
