// Common footer component for all pages
function loadFooter() {
    // Detect if we're in a subdirectory (pages/)
    const isInSubdir = window.location.pathname.includes('/pages/');
    const pathPrefix = isInSubdir ? '../' : '';

    const footerHTML = `
        <footer>
            <div class="footer-content">
                <div class="footer-grid">
                    <div class="footer-section">
                        <h4>Atlanta Ham Radio</h4>
                        <p>Connecting amateur radio operators to public service opportunities across the Atlanta metro area.</p>
                        <p>Curated and maintained by Jack Parks (KQ4JP)</p>
                    </div>

                    <div class="footer-section">
                        <h4>Quick Links</h4>
                        <ul class="footer-nav">
                            <li><a href="${pathPrefix}index.html#calendar">Event Calendar</a></li>
                            <li><a href="${pathPrefix}pages/clubs.html">Local Clubs</a></li>
                            <li><a href="${pathPrefix}pages/getstarted.html">Get Started</a></li>
                            <li><a href="${pathPrefix}pages/resources.html">Resources</a></li>
                        </ul>
                    </div>

                    <div class="footer-section">
                        <h4>Connect</h4>
                        <ul class="footer-nav">
                            <li><a href="${pathPrefix}pages/about.html">About KQ4JP</a></li>
                            <li><a href="https://www.youtube.com/@AtlantaHamRadio" target="_blank" rel="noopener noreferrer">YouTube Channel</a></li>
                        </ul>
                    </div>
                </div>

                <div class="footer-bottom">
                    <p>&copy; 2025 Atlanta Ham Radio &middot; All Rights Reserved &middot; Focused on public service and community involvement</p>
                </div>
            </div>
        </footer>
    `;

    document.body.insertAdjacentHTML('beforeend', footerHTML);
}

// Load footer when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadFooter);
} else {
    loadFooter();
}
