# CLAUDE.md - Atlanta Ham Radio Website

## Project Overview

**Atlanta Ham Radio** is a static website serving the amateur radio community in the Atlanta metropolitan area. It provides a centralized platform for:
- Public service event calendar with searchable, filterable events
- Amateur radio club directory organized by county
- Educational resources for new and experienced operators
- Community engagement and volunteer coordination

**Repository:** `discerningowl/atlantahamradio`
**Deployment:** DigitalOcean App Platform (static site)
**Tech Stack:** Pure HTML5, CSS3, Vanilla JavaScript (no frameworks)

---

## Repository Structure

```
atlantahamradio/
├── index.html                    # Main landing page with event calendar
├── 404.html                      # Custom 404 error page
├── events.ics                    # Static ICS calendar file (auto-generated)
├── sitemap.xml                   # XML sitemap for search engines
├── robots.txt                    # Robots.txt for crawler guidance
├── .gitignore                    # Git ignore file (.DS_Store)
├── pages/                        # Content pages
│   ├── clubs.html               # Club directory with search
│   ├── organizers.html          # Event organizers guide (for non-hams)
│   ├── getstarted.html          # Getting started guide
│   ├── resources.html           # Resources and links
│   ├── about.html               # About page with contact form
│   ├── arestaskbook.html        # ARES task book
│   ├── calendar-feed.html       # Calendar feed info
│   ├── changecall.html          # Callsign change guide
│   ├── everydayht.html          # Handheld radio guide
│   ├── hotspot-crossband.html   # Hotspot guide
│   ├── licensingtips.html       # Licensing tips
│   └── marsmods.html            # MARS modifications
├── data/                         # JSON data files
│   ├── events.json              # Event calendar data
│   └── clubs.json               # Club directory data
├── js/                          # JavaScript modules
│   ├── header.js                # Header component (navigation, theme toggle)
│   └── footer.js                # Footer component
├── css/
│   └── style.css                # Single stylesheet (all styles)
├── images/                      # Images and assets
│   ├── favicon.ico
│   ├── logo.png
│   ├── kq4jp.jpeg              # Profile photo
│   └── *.jpeg                   # Various images (HT guides, etc.)
├── scripts/                     # Build scripts (GitHub Actions only)
│   └── generate-calendar.js     # Generates events.ics from events.json
├── .do/                         # DigitalOcean deployment
│   └── app.yaml                 # App Platform configuration
├── .github/
│   ├── dependabot.yaml          # Dependency updates config
│   └── workflows/
│       └── generate-calendar.yml # Auto-generate events.ics workflow
├── CLAUDE.md                    # AI assistant documentation
└── README.md                    # General readme
```

---

## Technology Stack

### Core Technologies
- **HTML5**: Semantic markup, no templating engine
- **CSS3**: Single stylesheet with modern features
  - CSS Grid and Flexbox for layouts
  - CSS Custom Properties (minimal usage)
  - Backdrop filters for glass-morphism effects
  - Media queries for responsive design
- **JavaScript (ES6+)**: Vanilla JS, no frameworks
  - Async/await for data fetching
  - Template literals for dynamic HTML
  - Module pattern for components
  - Event delegation

### No Build Process (For Frontend)
- No npm/package.json (not required for local development)
- No transpilation or bundling
- Direct browser execution
- CDN for external resources

### Automated Calendar Generation
- **Node.js Script** (`scripts/generate-calendar.js`): Generates static `events.ics` file from `events.json`
- **GitHub Actions Workflow**: Automatically runs script when `events.json` is updated
- **Deployment**: `events.ics` is committed to repository and deployed with static files
- **Local Development**: Calendar generation is optional; not required for frontend development

---

## Architecture Patterns

### Component System
The site uses a lightweight component pattern with shared header/footer:

**Header Component** (`js/header.js`):
- Auto-detects subdirectory location
- Adjusts paths dynamically (`pathPrefix`)
- Mobile menu toggle functionality
- Logo, navigation, and links
- Dark/Light theme toggle with localStorage persistence
- System theme preference detection (prefers-color-scheme)
- Back to top button (shows on scroll)

**Footer Component** (`js/footer.js`):
- Consistent across all pages
- Quick links and social media
- Auto-adjusts paths for subdirectories

**Usage Pattern**:
```html
<body>
    <script src="../js/header.js"></script>
    <!-- Page content -->
    <script src="../js/footer.js"></script>
</body>
```

### Path Resolution
All JavaScript components detect if they're in a subdirectory:
```javascript
const isInSubdir = window.location.pathname.includes('/pages/');
const pathPrefix = isInSubdir ? '../' : '';
```

### Data Management
**Events** (`data/events.json`):
```json
{
  "events": [
    {
      "id": 1,
      "title": "Event Name",
      "date": "2025-11-01",        // Required: YYYY-MM-DD
      "endDate": "2025-11-02",      // Optional: multi-day events
      "time": "5:00am-11:00am",     // Optional: display format (for UI)
      "startTime": "05:00",         // Optional: HH:MM format (24-hour)
      "endTime": "11:00",           // Optional: HH:MM format (24-hour)
      "type": "race",               // race|event|training|meeting|emergency
      "location": "Atlanta, GA",
      "description": "...",         // Optional
      "contact": "https://..."      // Contact URL or info
    }
  ]
}
```

**Time Handling**:
- **`startTime`** and **`endTime`**: Structured time data in 24-hour format (HH:MM) for ICS generation
- **`time`**: Human-readable display format (e.g., "5:00am-11:00am") shown in UI
- **Single-day events** with `startTime`/`endTime`: Generate timed calendar events (DATETIME format)
- **Multi-day events** (with `endDate`): Always generate all-day events, even if times are present
- **Events without times**: Generate all-day events (DATE format)

**Clubs** (`data/clubs.json`):
```json
{
  "counties": [
    {
      "name": "County Name",
      "clubs": [
        {
          "name": "Club Name",
          "location": "City, State",
          "website": "https://...",
          "links": [                  // Additional links (Groups.io, Facebook, etc.)
            {
              "name": "Groups.io",
              "url": "https://..."
            }
          ]
        }
      ]
    }
  ]
}
```

---

## Design System

### Color Palette
```css
/* Primary Background */
background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%);

/* Primary Blue */
--primary: #3b82f6;
--primary-hover: #2563eb;

/* Accent Blue */
--accent: #60a5fa;
--accent-light: #93c5fd;

/* Text Colors */
--text-primary: #e2e8f0;
--text-secondary: #cbd5e1;
--text-muted: #94a3b8;

/* Event Type Colors */
--race: #3b82f6;      /* Blue */
--event: #a855f7;     /* Purple */
--training: #22c55e;  /* Green */
--meeting: #f97316;   /* Orange */
--emergency: #ef4444; /* Red */

/* Special Buttons */
--youtube: #FF0000;
--contact: #009933;
```

### Typography
- **Font Family**: System fonts stack
  ```css
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  ```
- **Monospace**: `'Monaco', 'Courier New', monospace` (for code/tables)

### Responsive Breakpoints
```css
/* Mobile */
@media (max-width: 768px) { }

/* Tablet */
@media (max-width: 1024px) { }

/* Small phones */
@media (max-width: 480px) { }
```

### Touch Target Sizing
- Minimum 44x44px for interactive elements on mobile
- Applied to buttons, navigation links, and filter controls

---

## Key Features

### 1. Event Calendar System

**Month View**:
- Grid calendar with day cells
- Shows up to 2 events per day
- "Today" highlighting
- Multi-day event spanning

**List View**:
- Chronological event list
- Filters future events only
- Search functionality
- Detailed event cards

**Event Types** (color-coded):
- `race` - Race/Run events (Blue)
- `event` - General events (Purple)
- `training` - Training/Nets (Green)
- `meeting` - Meetings/Hamfests (Orange)
- `emergency` - Emergency Drills (Red)

**Features**:
- Filter by event type
- Text search by event name
- Modal detail view
- ICS calendar export (individual events)
- Bulk calendar subscription (all events)

### 2. Club Directory

**Organization**:
- Grouped by county
- Collapsible sections
- Club count badges
- Search functionality

**Club Information**:
- Club name and location
- Website link (primary)
- Additional links (Groups.io, Facebook, etc.)

### 3. Theme Toggle (Dark/Light Mode)

**Features**:
- Light and dark theme options
- System preference detection (`prefers-color-scheme`)
- Persistent theme selection (localStorage)
- Smooth theme transitions
- Available on both desktop and mobile navigation
- Accessible with ARIA labels

**Implementation** (`js/header.js`):
```javascript
function initThemeToggle()
```
- Detects system theme preference on first visit
- Saves user preference to localStorage
- Synchronizes theme across desktop and mobile toggle buttons
- Updates theme icons (sun/moon) based on current theme
- Automatically updates if system preference changes (when no manual preference set)

**Theme Attribute**:
- `data-theme="light"` or `data-theme="dark"` on `<html>` element
- CSS uses attribute selectors to apply theme-specific styles

### 4. Back to Top Button

**Features**:
- Appears when scrolling down more than 300px
- Smooth scroll to top on click
- Fixed position in bottom-right corner
- Accessible with ARIA label
- Responsive design (adjusts on mobile)

**Implementation** (`js/header.js`):
```javascript
function initBackToTop()
```

### 5. About/Contact Page

**Location**: `pages/about.html`

**Features**:
- Profile information about KQ4JP (site maintainer)
- Profile photo display
- Links to QRZ.com profile and YouTube channel
- **Contact Form** with EmailJS integration
- Form fields: Name, Email, Subject, Message
- Form validation and submission status feedback
- Preconnect to external resources for performance

**Contact Form Implementation**:
- **EmailJS SDK**: Loaded asynchronously from CDN (`@emailjs/browser@4`)
- **Service**: EmailJS default service with template `template_pjb4rds`
- **Form Submission**: JavaScript prevents default, sends via EmailJS, provides user feedback
- **Error Handling**: Alert on success/failure, form reset on success
- **CSP**: Content Security Policy allows connection to `https://api.emailjs.com`

**Navigation**:
- Contact form accessible via:
  - Header navigation: "About" link
  - Homepage button: "Contact KQ4JP" (links to `pages/about.html#contactform`)
  - Direct link with anchor: `#contactform`

### 6. Event Organizers Page

**Location**: `pages/organizers.html`

**Purpose**: Educates event organizers (races, parades, public events) about the benefits of using amateur radio operators for event communications.

**Features**:
- Card-based layout matching getstarted.html design
- Anchor navigation for quick section access
- Three main sections:
  - **Why Use Ham Radio?** - 4 cards explaining advantages (reliability, deployment, emergency services, FCC licensing)
  - **Key Benefits** - 6 cards highlighting value propositions (cost, safety, scalability, goodwill, synergy, after-action)
  - **How to Get Started** - 6 cards with step-by-step guidance (contact clubs, define scope, secure frequencies, integrate ICS, pre-test, connect)
- Links to club directory and contact form for easy connection
- SEO optimized for event organizer searches

**Navigation**:
- Header navigation: "For Organizers" link (between Clubs and Get Started)
- Mobile navigation: Same position
- Target audience: Event organizers, municipalities, sponsors (non-ham operators)

### 7. Calendar Export (ICS)

**Individual Events** (Client-side):
```javascript
function downloadICS(event)
```
- Generates RFC 5545 compliant .ics files dynamically in browser
- All-day event format
- Proper escaping for special characters
- Downloads as `{event-title}.ics`

**Bulk Calendar Subscription** (Static File):
- **Static ICS File**: `events.ics` (auto-generated via GitHub Actions)
- **Subscribe Link**: `webcal://atlantahamradio.org/events.ics`
- **Generation**: Node.js script (`scripts/generate-calendar.js`) runs on push to `main` when `events.json` changes
- **Format**: RFC 5545 compliant, includes all events with proper formatting
- **Usage**: Can be subscribed to in Google Calendar, Outlook, Apple Calendar, etc.
- **Updates**: Calendar apps automatically refresh subscriptions (typically every 12-24 hours)

**Bulk Download** (Client-side fallback):
```javascript
function downloadAllEventsICS()
```
- Generates all events as single calendar file dynamically in browser
- Downloads as `atlanta-ham-radio-events.ics`
- Alternative to webcal:// subscription for one-time imports

---

## SEO Optimization

The site implements comprehensive SEO optimization to improve discoverability and search engine rankings.

### Meta Tags

All pages include:

**Primary Meta Tags**:
- `<title>` - Unique, descriptive title for each page (50-60 characters)
- `<meta name="description">` - Concise page description (150-160 characters)
- `<meta name="keywords">` - Relevant keywords for the page content
- `<meta name="author">` - Content author (KQ4JP)
- `<link rel="canonical">` - Canonical URL to prevent duplicate content

**Open Graph Tags** (for social media sharing):
- `og:type` - Content type (website)
- `og:url` - Canonical URL
- `og:title` - Page title
- `og:description` - Page description
- `og:image` - Social sharing image (logo.png)
- `og:locale` - Language/locale (en_US)
- `og:site_name` - Site name

**Twitter Card Tags** (for Twitter sharing):
- `twitter:card` - Card type (summary or summary_large_image)
- `twitter:url` - Page URL
- `twitter:title` - Page title
- `twitter:description` - Page description
- `twitter:image` - Sharing image

### Structured Data (JSON-LD)

**Organization Schema** (index.html):
```json
{
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Atlanta Ham Radio",
    "alternateName": "Atlanta Amateur Radio Public Service",
    "url": "https://atlantahamradio.org",
    "logo": "https://atlantahamradio.org/images/logo.png",
    "description": "Atlanta metro amateur radio public service event calendar and community resources",
    "sameAs": ["https://www.youtube.com/@AtlantaHamRadio"],
    "areaServed": {"@type": "State", "name": "Georgia"},
    "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "General Inquiries",
        "name": "KQ4JP"
    }
}
```

### Sitemap & Robots

**sitemap.xml**:
- XML sitemap listing all pages
- Includes priority and change frequency
- Updated: 2025-12-02
- Location: `https://atlantahamradio.org/sitemap.xml`

**robots.txt**:
- Allows all search engines to crawl the site
- Disallows crawling of `/data/`, `/.do/`, `/.github/`
- References sitemap.xml location

### SEO Best Practices

**Implemented**:
- ✅ Unique, descriptive titles for each page
- ✅ Meta descriptions under 160 characters
- ✅ Canonical URLs to prevent duplicate content
- ✅ Semantic HTML5 structure (headers, sections, articles)
- ✅ Open Graph and Twitter Card tags for social sharing
- ✅ JSON-LD structured data for organization
- ✅ XML sitemap for search engine crawling
- ✅ robots.txt to guide crawler behavior
- ✅ Content Security Policy headers
- ✅ HTTPS (via DigitalOcean)
- ✅ Mobile responsive design
- ✅ Fast page load times (no heavy frameworks)

**Future Enhancements** (optional):
- Event-specific structured data (Event schema)
- Dynamic sitemap generation from events.json
- Additional social media platform tags
- Breadcrumb structured data
- FAQ structured data for resource pages

### Adding SEO to New Pages

When creating a new page, include this SEO template in the `<head>`:

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self';">

<!-- Primary Meta Tags -->
<title>Page Title - Atlanta Ham Radio</title>
<meta name="title" content="Page Title - Atlanta Ham Radio">
<meta name="description" content="Concise description of the page content (150-160 characters).">
<meta name="keywords" content="relevant, keywords, for, this, page">
<meta name="author" content="KQ4JP">
<link rel="canonical" href="https://atlantahamradio.org/pages/pagename.html">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://atlantahamradio.org/pages/pagename.html">
<meta property="og:title" content="Page Title">
<meta property="og:description" content="Concise description of the page content.">
<meta property="og:image" content="https://atlantahamradio.org/images/logo.png">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="Atlanta Ham Radio">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary">
<meta name="twitter:url" content="https://atlantahamradio.org/pages/pagename.html">
<meta name="twitter:title" content="Page Title">
<meta name="twitter:description" content="Concise description of the page content.">
<meta name="twitter:image" content="https://atlantahamradio.org/images/logo.png">

<link rel="icon" type="image/x-icon" href="../images/favicon.ico">
<link rel="stylesheet" href="../css/style.css">
```

**Guidelines**:
- **Title**: 50-60 characters, include "Atlanta Ham Radio" for brand consistency
- **Description**: 150-160 characters, compelling and accurate
- **Keywords**: 5-10 relevant keywords, comma-separated
- **Canonical URL**: Use full https://atlantahamradio.org URL
- **Twitter Card**: Use "summary" for most pages, "summary_large_image" for homepage
- **Image**: Use logo.png or page-specific image if available
- **CSP**: Update `connect-src` if using external APIs (e.g., EmailJS requires `https://api.emailjs.com`)
- **Preconnect**: Add `<link rel="preconnect">` tags for external CDNs/APIs to improve performance

---

## Development Guidelines

### File Naming Conventions
- **HTML files**: lowercase, hyphenated (`get-started.html`)
- **Data files**: lowercase, no hyphens (`events.json`, `clubs.json`)
- **JavaScript files**: lowercase, no hyphens (`header.js`, `footer.js`)
- **CSS files**: lowercase, no hyphens (`style.css`)
- **Images**: lowercase, hyphenated (`logo.png`, `ht-bag.jpeg`)

### Code Style

**HTML**:
- 4-space indentation
- Lowercase tag names and attributes
- Double quotes for attributes
- Semantic HTML5 elements
- Self-contained JavaScript in `<script>` tags for page-specific logic

**CSS**:
- 4-space indentation
- Mobile-first approach
- Component-based class naming (`.event-card`, `.club-link`)
- Utility classes for states (`.active`, `.hidden`)
- Responsive styles at bottom of file

**JavaScript**:
- 4-space indentation
- `const`/`let` (no `var`)
- Arrow functions preferred
- Async/await for asynchronous operations
- Template literals for HTML generation
- Descriptive function names (verbs: `renderCalendar`, `loadEvents`)

### Adding New Pages

1. Create HTML file in `/pages/` directory
2. Use standard page structure:
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Page Title - Atlanta Ham Radio</title>
       <link rel="icon" type="image/x-icon" href="../images/favicon.ico">
       <link rel="stylesheet" href="../css/style.css">
   </head>
   <body>
       <script src="../js/header.js"></script>

       <section class="hero">
           <h2>Page Heading</h2>
           <p>Page description</p>
       </section>

       <!-- Page content -->

       <script src="../js/footer.js"></script>
   </body>
   </html>
   ```
3. Add navigation link to `js/header.js` if needed
4. Use existing CSS classes from `style.css`

### Adding Events

1. Edit `/data/events.json`
2. Add new event object to `events` array
3. Required fields: `id`, `title`, `date`, `type`, `location`, `contact`
4. Optional fields: `endDate`, `time`, `startTime`, `endTime`, `description`
5. Date format: `YYYY-MM-DD` (ISO 8601)
6. Time format: `HH:MM` (24-hour, e.g., "08:00", "16:30")
7. Increment `id` from highest existing ID

**Event Type Values**:
- `race` - Races, runs, marathons
- `event` - General community events
- `training` - Training sessions, nets, drills
- `meeting` - Club meetings, hamfests, conventions
- `emergency` - Emergency preparedness drills

**Adding Timed Events**:
- For single-day events with specific times, add `startTime` and `endTime` fields
- Format times in 24-hour notation: "08:00" for 8:00am, "16:00" for 4:00pm
- The `time` field can be formatted for display (e.g., "8:00am-4:00pm")
- Multi-day events will always appear as all-day events, regardless of time fields
- Example timed event:
  ```json
  {
    "id": 99,
    "title": "ARES Training",
    "date": "2026-03-14",
    "time": "8:00am-4:00pm",
    "startTime": "08:00",
    "endTime": "16:00",
    "type": "training",
    "location": "Forsyth, GA",
    "description": null,
    "contact": "https://gaares.org/"
  }
  ```

### Adding Clubs

1. Edit `/data/clubs.json`
2. Find or create county in `counties` array
3. Add club object to `clubs` array
4. Required fields: `name`, `location`, `website`, `links`
5. `links` can be empty array if no additional links
6. Keep counties alphabetically sorted
7. Keep clubs within county alphabetically sorted

### CSS Class Reference

**Layout Containers**:
- `.hero` - Hero section with title and description
- `.calendar-section` - Calendar container
- `.clubs-container` - Clubs directory container
- `.article-container` - Article/content pages (max-width: 900px)
- `.resources-container` - Resources page container

**Cards**:
- `.calendar-card` - Calendar wrapper
- `.event-card` - List view event card
- `.club-card` - Individual club card
- `.link-card` - Quick link cards on homepage and resources page
- `.card-header-row` - Flexbox container for icon and heading (used in .link-card)
- `.resource-card` - Resource item card

**Navigation**:
- `.header` - Site header (sticky)
- `.mobile-menu-btn` - Hamburger menu button
- `.mobile-nav` - Mobile navigation overlay
- `footer` - Site footer

**Components**:
- `.btn`, `.btn-primary`, `.btn-secondary` - Buttons
- `.search-box` - Search input wrapper
- `.modal` - Modal overlay
- `.filter-btn` - Filter buttons
- `.view-btn` - View toggle buttons

**States**:
- `.active` - Active state (buttons, modals, menus)
- `.hidden` - Hidden elements
- `.collapsed` - Collapsed sections
- `.today` - Today's date in calendar

**Event Types**:
- `.event-type-race` - Blue background
- `.event-type-event` - Purple background
- `.event-type-training` - Green background
- `.event-type-meeting` - Orange background
- `.event-type-emergency` - Red background

---

## Deployment

### Platform: DigitalOcean App Platform

**Configuration** (`.do/app.yaml`):
```yaml
name: atlantahamradio
region: atl

static_sites:
  - name: atlantahamradio
    environment_slug: html
    source_dir: /
    error_document: 404.html

    github:                              # ← MUST be "github", not "git"
      repo: discerningowl/atlantahamradio   # ← short username/repo format
      branch: main
      deploy_on_push: true                 # ← this turns auto-deploy on

    routes:
      - path: /

domains:
  - domain: atlantahamradio.org
    type: PRIMARY
    zone: atlantahamradio.org
```

**Deployment Process**:
1. Push changes to `main` branch
2. **GitHub Actions** (if `events.json` changed):
   - Workflow `.github/workflows/generate-calendar.yml` triggers
   - Runs `scripts/generate-calendar.js` to regenerate `events.ics`
   - Commits updated `events.ics` file (if changed)
   - Skips CI on auto-commit (`[skip ci]` in message)
3. **DigitalOcean** auto-deploys on push
4. No build step required for frontend (static files)
5. Served via global CDN

**Environment**:
- Node.js not required for frontend development
- Node.js 20 used in GitHub Actions for calendar generation
- No environment variables
- No backend/API endpoints
- Pure static file serving

### GitHub Actions Workflow

**File**: `.github/workflows/generate-calendar.yml`

**Trigger**:
- Push to `main` branch when `data/events.json` changes
- Manual trigger via `workflow_dispatch`

**Process**:
1. Checkout repository
2. Setup Node.js 20
3. Run `node scripts/generate-calendar.js`
4. Check if `events.ics` changed
5. If changed, commit and push to `main` branch
6. Auto-commit uses `[skip ci]` to prevent infinite loop

**Purpose**: Keeps static `events.ics` file in sync with `events.json` for calendar subscriptions

---

## Testing Considerations

### Manual Testing Checklist

**Responsive Design**:
- [ ] Test on mobile (< 768px)
- [ ] Test on tablet (768px - 1024px)
- [ ] Test on desktop (> 1024px)
- [ ] Verify touch targets are 44x44px minimum
- [ ] Test mobile menu functionality

**Calendar Features**:
- [ ] Month navigation (previous/next)
- [ ] View toggle (month/list)
- [ ] Event filtering by type
- [ ] Search functionality
- [ ] Event modal opens/closes
- [ ] ICS download (single event)
- [ ] ICS download (all events)
- [ ] ICS subscription link works (webcal://)
- [ ] Multi-day events display correctly

**Clubs Directory**:
- [ ] County sections expand/collapse
- [ ] Search filters counties and clubs
- [ ] All links open correctly
- [ ] Website links work
- [ ] Additional links work

**UI/UX Features**:
- [ ] Theme toggle works (desktop)
- [ ] Theme toggle works (mobile)
- [ ] Theme persists on page reload
- [ ] System theme preference detected
- [ ] Back to top button appears on scroll
- [ ] Back to top button scrolls smoothly
- [ ] Back to top button hidden at top of page

**Contact Form** (`pages/about.html`):
- [ ] Form loads correctly
- [ ] All fields validate (required fields)
- [ ] Email field validates email format
- [ ] Form submission works
- [ ] Success message displays
- [ ] Form resets after submission
- [ ] Error handling displays on failure

**Navigation**:
- [ ] All header links work
- [ ] All footer links work
- [ ] About link goes to about.html
- [ ] Contact button links to about.html#contactform
- [ ] Logo links to homepage
- [ ] Paths work from subdirectories
- [ ] Mobile menu opens/closes
- [ ] Mobile menu closes on link click

**Cross-browser**:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (desktop and iOS)
- [ ] Chrome mobile (Android)

### Common Issues

**Path Issues**:
- Always use relative paths
- Header/footer components handle path prefixing
- Images in pages: `../images/`
- CSS in pages: `../css/`
- Data in pages: `../data/`

**Date Handling**:
- Events use local timezone-aware date parsing
- Format: `YYYY-MM-DD` in JSON
- JavaScript creates Date objects with local timezone
- ICS exports use DATE (not DATETIME) for all-day events

**Mobile Navigation**:
- Mobile menu uses fixed positioning
- Body scroll is disabled when menu open
- Menu closes on outside click
- Menu closes on link click

---

## Content Guidelines

### Event Descriptions
- Be concise and informative
- Include key details (requirements, contact info)
- Link to official event websites
- Use null for empty optional fields (not empty strings)

### Club Information
- Use official club names
- Link to primary club website
- Include location (city or county)
- Add Groups.io, Facebook, or other links as available
- Keep contact information current

### Resource Pages
- Use article-container class for consistent styling
- Structure with h2/h3/h4 headings
- Use callout boxes for important information:
  - `.callout.info` - General information
  - `.callout.warning` - Warnings/cautions
  - `.callout.tip` - Helpful tips
- Link to external resources
- Keep content beginner-friendly

---

## Common Modification Tasks

### Updating Event Data
**Location**: `/data/events.json`

```json
{
  "id": 26,
  "title": "New Event Name",
  "date": "2026-12-01",
  "endDate": null,
  "time": "10:00am-2:00pm",
  "type": "meeting",
  "location": "Atlanta, GA",
  "description": "Event details here",
  "contact": "https://example.com"
}
```

**Steps**:
1. Find highest ID in events array
2. Increment by 1 for new event
3. Add to events array
4. Keep date format consistent
5. Use correct event type
6. Test calendar display

### Adding a Club
**Location**: `/data/clubs.json`

```json
{
  "name": "New Club Name",
  "location": "City, GA",
  "website": "https://clubwebsite.com",
  "links": [
    {
      "name": "Groups.io",
      "url": "https://groups.io/g/clubname"
    },
    {
      "name": "Facebook",
      "url": "https://facebook.com/groups/clubname"
    }
  ]
}
```

**Steps**:
1. Find or create county section
2. Add club to clubs array
3. Keep alphabetically sorted
4. Include all available links
5. Use empty array for links if none
6. Test club directory display

### Modifying Styles
**Location**: `/css/style.css`

**Color Changes**:
- Search for color hex codes
- Update consistently across file
- Test dark/light contrast
- Verify accessibility (WCAG AA)

**Layout Changes**:
- Use existing grid/flexbox patterns
- Maintain responsive breakpoints
- Test mobile layouts first
- Use browser dev tools

**Adding New Component Styles**:
1. Add base styles
2. Add hover/active states
3. Add responsive overrides in media queries
4. Use existing color variables

### Creating New Content Pages
**Steps**:
1. Copy existing page structure from `/pages/`
2. Update `<title>` tag
3. Update hero section (h2, p)
4. Add main content in sections
5. Use `.article-container` for long-form content
6. Use existing CSS classes
7. Add to navigation if needed (header.js)
8. Test responsive layout
9. Test all links

---

## AI Assistant Guidelines

### When Analyzing This Codebase
1. Recognize this is a **static site with no build process for frontend**
2. All JavaScript runs directly in browser (no transpilation)
3. Components are loaded via script tags, not imports
4. Data is client-side only (JSON files via fetch)
5. No backend, API, or server-side logic
6. GitHub Actions automates `events.ics` generation (not required for local development)

### When Making Changes
1. **Never suggest npm/build tools** - this is intentionally simple
2. **Use vanilla JavaScript** - no frameworks or libraries
3. **Maintain existing code style** - 4-space indentation, ES6+ features
4. **Test responsive behavior** - mobile-first approach
5. **Preserve accessibility** - semantic HTML, ARIA labels, keyboard navigation
6. **Keep it simple** - avoid over-engineering

### When Adding Features
1. **Use existing patterns** - follow component structure
2. **Update data files** - don't hardcode content in HTML
3. **Add CSS classes** - don't use inline styles
4. **Maintain consistency** - use existing color palette and spacing
5. **Consider mobile** - touch targets, responsive layout
6. **Test without build** - code must run directly in browser

### When Debugging
1. **Check browser console** - all errors visible in dev tools
2. **Verify file paths** - common issue in subdirectories
3. **Check JSON syntax** - malformed JSON breaks data loading
4. **Test data loading** - fetch calls may fail silently
5. **Inspect responsive breakpoints** - resize browser to test

### When Refactoring
1. **Maintain backward compatibility** - links and URLs shouldn't break
2. **Test thoroughly** - no automated tests, manual testing required
3. **Preserve user experience** - calendar, search, filters must work
4. **Keep it accessible** - screen readers, keyboard navigation
5. **Document changes** - update this file if architecture changes

---

## Key Contacts

**Site Maintainer**: KQ4JP
**About/Contact Page**: `/pages/about.html`
**Repository**: `discerningowl/atlantahamradio`

---

## Version History

**Current State** (as of December 7, 2025):
- Static HTML/CSS/JS site (no build process for frontend)
- Event calendar with month/list views, search, and filtering
- ICS calendar export (individual events and bulk subscription)
- Static `events.ics` file auto-generated via GitHub Actions
- Club directory with search and collapsible county sections
- Dark/Light theme toggle with localStorage persistence
- About page with EmailJS contact form integration
- Back to top button with smooth scrolling
- Multiple resource pages (getting started, ARES, equipment guides)
- DigitalOcean deployment with auto-deploy from `main` branch
- Mobile responsive design with hamburger menu
- Comprehensive SEO optimization (meta tags, structured data, sitemap)
- GitHub Actions workflow for automated calendar generation

---

## Quick Reference

### Important Files
- `index.html` - Homepage with calendar
- `pages/about.html` - About page with contact form
- `data/events.json` - Event data (source of truth)
- `data/clubs.json` - Club data
- `events.ics` - Static calendar file (auto-generated, do not edit manually)
- `scripts/generate-calendar.js` - Node.js script to generate events.ics
- `.github/workflows/generate-calendar.yml` - GitHub Actions workflow
- `css/style.css` - All styles (including theme styles)
- `js/header.js` - Navigation component (header, theme toggle, back to top)
- `js/footer.js` - Footer component

### Key Functions

**Calendar** (`index.html`):
- `loadEvents()` - Fetches and parses event data from events.json
- `renderCalendar()` - Renders calendar view (month grid)
- `setView('month'|'list')` - Toggles between month and list views
- `setFilter(type)` - Filters events by type
- `downloadICS(event)` - Exports single event as .ics file
- `downloadAllEventsICS()` - Exports all events as single .ics file
- `changeMonth(delta)` - Navigates between months

**Clubs** (`pages/clubs.html`):
- `loadClubs()` - Fetches club data from clubs.json
- `filterClubs()` - Searches clubs by name, location, or county

**Header** (`js/header.js`):
- `loadHeader()` - Injects header HTML into page
- `initMobileMenu()` - Sets up mobile navigation functionality
- `initThemeToggle()` - Initializes theme toggle with localStorage
- `initBackToTop()` - Sets up back to top button
- `initializeTheme()` - Detects and sets initial theme preference
- `loadYouTubeButton()` - Returns YouTube button HTML (helper function)

**Contact Form** (`pages/about.html`):
- EmailJS integration for form submission (inline script)

### File Paths Reference
```
From root:        href="index.html"     src="js/header.js"
From /pages/:     href="../index.html"  src="../js/header.js"
```

### Color Reference
```
Primary:   #3b82f6  Background: #0f172a  Text: #e2e8f0
Accent:    #60a5fa  Card:       #1e293b  Muted: #94a3b8
Success:   #22c55e  Border:     #475569
Warning:   #f59e0b
Error:     #ef4444
```

---

**Last Updated**: December 7, 2025
**Format Version**: 1.1
