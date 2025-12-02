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
                    <a href="${pathPrefix}pages/getstarted.html">Get Started</a>
                    <a href="${pathPrefix}pages/resources.html">Resources</a>
                    <a href="${pathPrefix}pages/contact.html">Contact</a>
                </nav>
                <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Toggle mobile menu">
                    <svg class="hamburger-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
                    <svg class="close-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
            </div>
            <nav class="mobile-nav" id="mobileNav">
                <a href="${pathPrefix}index.html#calendar">Calendar</a>
                <a href="${pathPrefix}pages/clubs.html">Clubs</a>
                <a href="${pathPrefix}pages/getstarted.html">Get Started</a>
                <a href="${pathPrefix}pages/resources.html">Resources</a>
                <a href="${pathPrefix}pages/contact.html">Contact</a>
            </nav>
        </header>
    `;

    document.body.insertAdjacentHTML('afterbegin', headerHTML);

    // Initialize mobile menu after DOM insertion
    initMobileMenu();
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

// Load header when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHeader);
} else {
    loadHeader();
}
