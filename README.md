# Toggl Time Summary

A browser-based web app that fetches time entries from the Toggl Track API, aggregates them by project and day, and displays them in a clean UI with Swiss date formatting and interactive copy features.

## ✨ Features

### Data Fetching & Processing
- Fetches time entries from Toggl Track API v9
- Multiple date range options: current week, last week, current month, last month
- Groups entries by project and day
- Aggregates and deduplicates descriptions
- Calculates total hours per project per day

### Interactive UI
- **Two View Modes**:
  - **By Day**: Shows days with projects nested inside
  - **By Project**: Shows projects with days nested inside
- **Smart Copy Functionality**:
  - Click once on a card → copies description
  - Click twice quickly → copies the time in decimal format
  - Click directly on time badge → copies only the time value
  - Visual feedback shows what was copied
- **Swiss Date Format**: Dates displayed as DD.MM.YYYY (e.g., 17.01.2026)
- **Description Formatting**: Multiple descriptions concatenated with " / " and newlines
- **Custom Color Scheme**: Professional blue, green, purple, and dark blue palette
- Clean, responsive design that works on desktop and mobile

### Multi-User Support
- Each user enters their own Toggl API token
- Tokens stored securely in browser localStorage
- No backend required - all processing happens in the browser
- Perfect for sharing with teams

## 🎨 Color Scheme

- **Blue** (#39B2B9): Primary actions, highlights
- **Green** (#97D700): Success states, save button
- **Purple** (#A64D85): Accents, clear button
- **Dark Blue** (#13294B): Headers, titles
- **Gray** (#4A4A4A): Text, labels

## 🚀 Quick Start

### Option 1: GitHub Pages (Recommended)

Deploy to GitHub Pages for free hosting:

```bash
# Install dependencies
npm install

# Build static HTML
npm run build:static

# Follow deployment guide
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed GitHub Pages deployment instructions.

### Option 2: Local Development

Run locally for testing:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## 📋 Prerequisites

- Node.js (v16 or higher) - only for development/building
- npm or yarn - only for development/building
- A Toggl Track account with API access
- Modern web browser (Chrome, Firefox, Edge, Safari)

## 🔑 Getting Your Toggl API Token

Each user needs their own API token:

1. Log in to [Toggl Track](https://track.toggl.com/)
2. Go to Profile settings
3. Scroll down to find the API token
4. Copy and paste it into the app's Settings section

The token is stored in your browser's localStorage and never sent to any server except Toggl's API.

## 💻 Usage Guide

### First Time Setup

1. Open the app in your browser
2. Scroll to the Settings section at the bottom
3. Enter your Toggl API token
4. Click "Save & Load Data"
5. Your time entries will load automatically

### Switching Date Ranges

Use the navigation buttons at the top:
- **Current Week**: Monday to Sunday of this week
- **Last Week**: Monday to Sunday of last week
- **Current Month**: First to last day of this month
- **Last Month**: First to last day of last month

### Switching Views

Toggle between two views:
- **By Day**: See all projects for each day
- **By Project**: See all days for each project

### Copying Data

Three ways to copy:

1. **Copy Description + Time (two-click)**:
   - Click once on a card → description copied
   - Click again within 1 second → time copied

2. **Copy Time Only (single-click)**:
   - Click directly on the time badge
   - Copies just the decimal hours (e.g., "3.50")

3. **Visual Feedback**:
   - Tooltip shows what was copied
   - "Description copied! Click again for time."
   - "Time copied!"

### Managing Settings

Settings section at the bottom:
- **Hide/Show**: Toggle settings visibility
- **Save & Load Data**: Save your token and fetch data
- **Clear**: Remove your saved token
- **Persistent Storage**: Token saved in localStorage

## 📁 Project Structure

```
toggl-time-summary/
├── src/
│   ├── index.ts              # Express server (dev only)
│   └── client-side-app.ts    # Main app logic & UI
├── scripts/
│   └── build-static.js       # Build script for GitHub Pages
├── docs/
│   └── index.html            # Generated static HTML (GitHub Pages)
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── README.md                 # This file
└── DEPLOYMENT.md             # GitHub Pages deployment guide
```

## 🛠️ Development

### Running Locally

```bash
# Install dependencies
npm install

# Start dev server with hot reload
npm run dev

# Open http://localhost:3000
```

### Building for Deployment

```bash
# Build TypeScript
npm run build

# Generate static HTML for GitHub Pages
npm run build:static
```

The `build:static` script creates `docs/index.html` - a standalone HTML file with all code embedded.

### Making Changes

1. Edit `src/client-side-app.ts`
2. Test locally with `npm run dev`
3. Build static HTML with `npm run build:static`
4. Deploy by pushing `docs/index.html` to GitHub

## 🔒 Security & Privacy

### How It Works

- **Client-Side Only**: All code runs in your browser
- **No Backend**: No server processes or stores your data
- **Direct API Calls**: Browser communicates directly with Toggl API
- **LocalStorage**: API tokens stored in browser storage
- **HTTPS**: GitHub Pages provides secure HTTPS

### What's Stored

- **In Your Browser**: Your Toggl API token (localStorage)
- **On Our Server**: Nothing - there is no server!
- **On Toggl's Servers**: Your time tracking data (as usual)

### Security Best Practices

- ✅ API token stays in your browser
- ✅ Token never sent to our server (there isn't one!)
- ✅ Direct HTTPS connection to Toggl API
- ✅ Clear token anytime from settings
- ✅ Each user manages their own token
- ⚠️ Don't share your API token with others
- ⚠️ Use HTTPS when hosting (GitHub Pages does this automatically)

## 🌐 Browser Compatibility

Tested and working on:
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

Requires:
- JavaScript enabled
- LocalStorage enabled
- Modern browser (ES6+ support)

## 🐛 Troubleshooting

### "Failed to load data" Error

- Verify your API token is correct
- Check that you have time entries in the selected date range
- Ensure your browser allows API calls to Toggl (CORS)
- Try a different browser

### Token Not Saving

- Check that localStorage is enabled
- Some browsers block localStorage in private/incognito mode
- Clear browser cache and try again

### Copy Not Working

- Modern browsers require HTTPS for clipboard access
- GitHub Pages provides HTTPS automatically
- Check browser console (F12) for errors

### No Time Entries Showing

- Make sure you have time entries logged in Toggl
- Check the selected date range
- Try switching to a different date range
- Verify entries have valid start/stop times (not running)

## 📚 API Reference

Uses Toggl Track API v9:

- `GET /api/v9/me/time_entries` - Fetch time entries
  - Params: `start_date`, `end_date` (YYYY-MM-DD)
- `GET /api/v9/me/projects` - Fetch projects

Authentication: Basic Auth with API token

Documentation: [Toggl API Docs](https://developers.track.toggl.com/docs/)

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 📄 License

ISC

## 🙏 Acknowledgments

- Built with vanilla JavaScript (no frameworks!)
- Toggl Track API for time tracking data
- Swiss date format for professional display
- Custom color scheme for brand consistency

---

**Made with ❤️ for better time tracking**
