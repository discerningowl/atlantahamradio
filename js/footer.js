// Common footer component for all pages
function loadFooter() {
    // Detect if we're in a subdirectory (pages/)
    const isInSubdir = window.location.pathname.includes('/pages/');
    const pathPrefix = isInSubdir ? '../' : '';

    // Per-page "validated" date, set via <meta name="page-validated" content="YYYY-MM-DD"> in each page's <head>
    let validatedHTML = '';
    const validatedMeta = document.querySelector('meta[name="page-validated"]');
    if (validatedMeta && validatedMeta.content) {
        const validatedDate = new Date(validatedMeta.content + 'T00:00:00');
        if (!isNaN(validatedDate)) {
            const formattedDate = validatedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            validatedHTML = `
                    <p class="footer-validated">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        Page validated since ${formattedDate}
                    </p>`;
        }
    }

    const footerHTML = `
        <footer>
            <div class="footer-content">
                <div class="footer-grid">
                    <div class="footer-section">
                        <h4>Atlanta Ham Radio</h4>
                        <p>Connecting amateur radio operators to public service opportunities across the Atlanta metro area.</p>
                        <br>
                        <p>Curated and maintained by <strong>Jack Parks (KQ4JP)</strong></p>
                    </div>

                    <div class="footer-section">
                        <h4>Quick Links</h4>
                        <ul class="footer-nav">
                            <li><a href="${pathPrefix}index.html#calendar">Event Calendar</a></li>
                            <li><a href="${pathPrefix}pages/clubs.html">Local Clubs</a></li>
                            <li><a href="${pathPrefix}pages/organizers.html">For Organizers</a></li>
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
                    <p>&copy; ${new Date().getFullYear()} Atlanta Ham Radio &middot; All Rights Reserved &middot; Focused on public service and community involvement</p>${validatedHTML}
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
