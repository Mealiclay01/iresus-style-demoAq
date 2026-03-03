# Medical Guidelines Demo

A polished, client-ready demo of a medical guidelines application. Built with vanilla HTML/CSS/JavaScript as a static site, featuring a modern UI inspired by medical apps but with completely original design, content, and assets.

## ✨ Features

### Home Screen
- **Hero Section** - Welcoming introduction with tagline
- **Search** - Real-time filtering of guidelines by title/subtitle
- **Favorites** - Star/unstar algorithms (saved in localStorage)
- **Dark Mode** - Toggle between light and dark themes (persists preference)
- **Version Chip** - Display current demo version

### Algorithm Screen
- **Real Tabs** - Switch between Overview, Drugs, and Notes
- **Vertical Flow** - Step-by-step algorithm visualization
- **Branch Navigation** - Interactive decision points with smooth animations
- **Reference Images** - Click camera icons to view detailed SVG references in modal
- **Sticky Action Bar** (mobile) - Quick access to Back, Home, and Sound toggle
- **Loading Skeleton** - Smooth loading state

### User Experience
- **Mobile-First Design** - Optimized for smartphone display
- **Smooth Animations** - Polished transitions and interactions
- **Keyboard Navigation** - Full accessibility support
- **UI Sounds** (optional) - Subtle audio feedback using Web Audio API
- **PWA Support** - Installable as standalone app with offline capability

### Technical
- **No Build Step** - Pure static files, runs via simple HTTP server
- **No External Dependencies** - All assets bundled locally
- **Dark Mode** - CSS variables with localStorage persistence
- **Service Worker** - Offline caching for PWA functionality

## 🚀 Quick Start

### Run Locally

```bash
# Navigate to project directory
cd iresus-style-demoAq

# Start HTTP server
python3 -m http.server 8090

# Open in browser
# http://localhost:8090
```

The app will be available at `http://localhost:8090`

### Install as PWA (Optional)

1. Open the app in Chrome/Edge/Safari
2. Look for the install prompt in the browser
3. Click "Install" to add to home screen
4. Launch as standalone app

## 📁 Project Structure

```
/
├── index.html              # Home screen
├── algorithm.html          # Algorithm viewer
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker for offline support
├── README.md              # This file
└── assets/
    ├── app.css            # Main styles (dark mode support)
    ├── app.js             # Home screen logic
    ├── algo.js            # Algorithm screen logic
    ├── data.json          # Guidelines data model
    ├── icons/
    │   ├── back.svg       # Navigation icons
    │   ├── camera.svg
    │   ├── clipboard.svg
    │   ├── home.svg
    │   ├── pwa-icon-192.svg
    │   └── pwa-icon-512.svg
    └── images/
        ├── als_ref.svg           # Advanced Life Support
        ├── choking_ref.svg       # Choking management
        ├── newborn_ref.svg       # Newborn life support
        ├── airway_ref.svg        # Airway techniques
        ├── cpr_ref.svg           # CPR technique
        ├── anaphylaxis_ref.svg   # Anaphylaxis protocol
        ├── shockable_ref.svg     # Shockable rhythm
        └── nonshockable_ref.svg  # Non-shockable rhythm
```

## 🎨 Customization

### Adding New Algorithms

Edit `assets/data.json`:

```json
{
  "sections": [
    {
      "id": "your-section",
      "title": "Your Section",
      "items": [
        {
          "id": "new-algo",
          "title": "Your Algorithm",
          "subtitle": "Short description"
        }
      ]
    }
  ],
  "algorithms": {
    "new-algo": {
      "title": "Your Algorithm",
      "tabs": [...],
      "drugsCards": [...],
      "notesMarkdown": "...",
      "steps": [...]
    }
  }
}
```

### Creating Reference Images

Reference images are SVG files in `assets/images/`. To create new ones:

1. Copy an existing SVG file as template
2. Modify the header color, title, and bullet points
3. Keep the same viewBox and structure for consistency
4. Reference in data.json:

```json
{
  "icon": "camera",
  "image": {
    "url": "./assets/images/your-ref.svg",
    "caption": "Your caption here"
  }
}
```

### Modifying Colors

Edit CSS variables in `assets/app.css`:

```css
:root {
  --primary: #2563eb;        /* Main accent color */
  --ink: #1a1a1f;            /* Text color */
  --bg: #f9fafb;             /* Background */
  --card: #ffffff;           /* Card background */
  /* ... more variables */
}

[data-theme="dark"] {
  /* Dark mode overrides */
}
```

### Disabling Sounds

**User Option:**
- Click the Sound toggle button in the bottom action bar (mobile)
- Or set via browser console: `localStorage.setItem('soundEnabled', 'false')`

**Developer Option:**
- In `assets/app.js` and `assets/algo.js`, change:
```javascript
enabled: localStorage.getItem('soundEnabled') === 'true',
// to
enabled: false,
```

### Customizing Step Colors

Available color classes in data.json:
- `blue` - Primary blue header
- `maroon` - Deep red header
- `green` - Green header
- `grey` - Neutral grey step
- `peach` - Light peach step
- `red` - Red/urgent step
- `yellow` - Yellow/warning step

## 📱 Browser Compatibility

Tested and working on:
- ✅ Safari (iOS & macOS)
- ✅ Chrome (Desktop & Android)
- ✅ Edge (Desktop)
- ✅ Firefox (Desktop)

## 🔧 Development

### Testing Changes

1. Make edits to HTML/CSS/JS files
2. Refresh browser (Cmd+R / Ctrl+R)
3. For service worker changes, do hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

### Updating Service Worker Cache

When adding new files, update `sw.js`:

```javascript
const CACHE_NAME = 'guidelines-demo-v0.4'; // Increment version
const urlsToCache = [
  // Add new files here
];
```

### Debugging

Open browser DevTools:
- **Console** - View logs and errors
- **Application** (Chrome) / **Storage** (Firefox) - Inspect localStorage, service worker
- **Network** - Monitor resource loading
- **Lighthouse** (Chrome) - PWA audit

## 📄 Data Model Reference

### Algorithm Structure

```json
{
  "title": "Algorithm Name",
  "tabs": [
    {"id": "overview", "label": "Overview"},
    {"id": "drugs", "label": "Drugs"},
    {"id": "notes", "label": "Notes"}
  ],
  "drugsCards": [
    {
      "name": "Drug Name",
      "dose": "Dosage",
      "route": "Administration route",
      "notes": "Additional information"
    }
  ],
  "notesMarkdown": "### Heading\n\nText\n\n- Bullet\n- Points",
  "steps": [...]
}
```

### Step Types

**Header:**
```json
{
  "id": "unique-id",
  "type": "header",
  "color": "blue",
  "text": "Step text",
  "icon": "clipboard",
  "image": {"url": "...", "caption": "..."}
}
```

**Step:**
```json
{
  "id": "unique-id",
  "type": "step",
  "color": "grey",
  "text": "Step text",
  "icon": "camera"
}
```

**Pill (informational):**
```json
{
  "id": "unique-id",
  "type": "pill",
  "text": "Informational text"
}
```

**Branch (decision point):**
```json
{
  "id": "unique-id",
  "type": "branch",
  "options": [
    {"label": "Option A", "to": "target-step-id", "color": "red"},
    {"label": "Option B", "to": "target-step-id", "color": "green"}
  ]
}
```

## 🎯 Design Principles

- **Original Content** - All text, images, and layouts are custom-created
- **Mobile-First** - Optimized for smartphone (320px - 520px width)
- **Accessible** - Keyboard navigation, ARIA labels, high contrast
- **Fast** - No external dependencies, minimal JavaScript
- **Offline-Capable** - Service worker caching for PWA
- **Professional** - Clean, modern UI suitable for client presentation

## 📝 License & Attribution

This is a demo project. All content, images, and code are original and created for demonstration purposes only.

⚠️ **Not for Clinical Use** - This is a prototype/demo application. Do not use for actual medical decision-making.

## 🤝 Support

For questions or issues:
1. Check browser console for errors
2. Verify Python HTTP server is running
3. Try hard refresh to clear cache
4. Ensure all files are in correct locations

---

**Demo Version:** 0.3  
**Last Updated:** 2026-03-03

