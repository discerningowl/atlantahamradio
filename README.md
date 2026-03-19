# Atlanta Ham Radio

A community website connecting amateur radio operators to public service events, clubs, and resources across the Atlanta metropolitan area.

## 🎯 Purpose

This website serves the Atlanta ham radio community by providing:

- **Event Calendar**: Searchable, filterable calendar of public service events (races, training, meetings, emergency drills)
- **Club Directory**: Comprehensive directory of amateur radio clubs organized by county
- **Educational Resources**: Guides for new and experienced operators
- **Community Engagement**: Connect volunteers with public service opportunities

## ✨ Features

### 📅 Event Calendar
- Month and list view options
- Filter by event type (race, event, training, meeting, emergency)
- Search events by name
- ICS calendar export (individual events or bulk subscription)
- Multi-day event support
- Responsive mobile-friendly design

### 📡 Club Directory
- Organized by county
- Searchable by club name, location, or county
- Direct links to club websites and Groups.io pages
- Collapsible county sections
- Club count badges

### 📚 Resources
- Getting started guides
- ARES task book
- Licensing tips
- Equipment guides (handhelds, hotspots, etc.)
- Callsign change procedures

## 🛠️ Technology Stack

**Pure Static Website** - No build process required!

- **HTML5**: Semantic markup
- **CSS3**: Modern responsive design with grid/flexbox
- **Vanilla JavaScript**: ES6+ features, no frameworks
- **External Dependencies**: Lucide Icons (CDN)

### Why No Framework?

This project intentionally uses vanilla HTML/CSS/JS to:
- Minimize complexity and dependencies
- Ensure fast load times
- Make the codebase accessible to all skill levels
- Avoid build tools and compilation steps
- Enable direct deployment without configuration

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/discerningowl/atlantahamradio.git
   cd atlantahamradio
   ```

2. **Open in browser**

   Simply open `index.html` in your web browser, or use a local server:

   ```bash
   # Python 3
   python -m http.server 8000

   # Python 2
   python -m SimpleHTTPServer 8000

   # Node.js (if you have npx)
   npx serve
   ```

3. **Visit**: `http://localhost:8000`

That's it! No npm install, no build steps. 🎉

## 📁 Project Structure

```
atlantahamradio/
├── index.html              # Homepage with event calendar
├── pages/                  # Content pages
│   ├── clubs.html         # Club directory
│   ├── getstarted.html    # Getting started guide
│   ├── resources.html     # Resources page
│   └── ...                # Other content pages
├── data/                   # JSON data files
│   ├── events.json        # Event calendar data
│   └── clubs.json         # Club directory data
├── js/                     # JavaScript components
│   ├── header.js          # Header/navigation
│   └── footer.js          # Footer
├── css/
│   └── style.css          # All styles (single file)
├── images/                 # Images and assets
└── .do/                    # DigitalOcean deployment config
```

## 📝 Contributing

### Adding Events

Edit `data/events.json` and add a new event object:

```json
{
  "id": 26,
  "title": "Event Name",
  "date": "2026-12-01",
  "endDate": null,
  "time": "10:00am-2:00pm",
  "type": "race",
  "location": "Atlanta, GA",
  "description": "Event details here",
  "contact": "https://example.com"
}
```

**Event Types**: `race`, `event`, `training`, `meeting`, `emergency`

### Adding Clubs

Edit `data/clubs.json` and add a new club to the appropriate county:

```json
{
  "name": "Club Name",
  "location": "City, GA",
  "website": "https://clubwebsite.com",
  "links": [
    {
      "name": "Groups.io",
      "url": "https://groups.io/g/clubname"
    }
  ]
}
```

### Making Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test locally in a browser
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 🌐 Deployment

This site is deployed on **DigitalOcean App Platform** with automatic deployments enabled.

- **Branch**: `main`
- **Deployment**: Automatic on push
- **Build**: None required (static files)
- **CDN**: Global distribution via DigitalOcean CDN

### Deploy Your Own

1. Fork this repository
2. Visit [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
3. Click "Create App"
4. Select your forked repository
5. Choose `main` branch
6. Deploy!

Configuration is stored in `.do/app.yaml`.

## 📖 Documentation

For detailed technical documentation, architecture details, and AI assistant guidelines, see [`CLAUDE.md`](./CLAUDE.md).

This includes:
- Complete architecture patterns
- Data schemas and examples
- CSS class reference
- Development guidelines
- Common modification tasks

## 🎨 Design System

- **Colors**: Dark blue gradient theme with color-coded event types
- **Typography**: System font stack for optimal performance
- **Responsive**: Mobile-first design with 3 breakpoints (480px, 768px, 1024px)
- **Accessibility**: Semantic HTML, ARIA labels, 44px touch targets

## 📱 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## 📞 Contact

**Maintainer**: KQ4JP

For questions, club additions, or event submissions:
- Visit the [Contact Page](pages/about.html)
- YouTube: [@AtlantaHamRadio](https://www.youtube.com/@AtlantaHamRadio)

## 📄 License

This project is maintained for the Atlanta amateur radio community. Feel free to use this codebase as a template for your own regional ham radio community site.

## 🙏 Acknowledgments

- Atlanta area amateur radio clubs
- ARES volunteers
- Amateur radio operators supporting public service events
- DigitalOcean for hosting

---

**73!** 📻

Built with ❤️ for the Atlanta ham radio community
