# Toggl Time Summary

A browser-based web app that fetches time entries from the Toggl Track API, aggregates them by project and day, and displays them in a clean UI with Swiss date formatting and interactive copy features.

## Features

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
  - Click once on a card → copies time in decimal format
  - Click twice quickly → copies the description text
  - Click directly on time badge → copies only the time value
  - Visual feedback shows what was copied
- **Swiss Date Format**: Dates displayed as DD.MM.YYYY (e.g., 17.01.2026)
- **Description Formatting**: Multiple descriptions concatenated with " / " and newlines
- Clean, responsive design that works on desktop and mobile

### Navigation
- Easy switching between date ranges
- Toggle between "By Day" and "By Project" views
- All selections preserved in URL query parameters

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Toggl Track account with API access

## Setup Instructions

### 1. Get Your Toggl API Token

1. Log in to [Toggl Track](https://track.toggl.com/)
2. Go to your Profile settings
3. Scroll down to find your API token
4. Copy the token

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your Toggl API token:

```env
TOGGL_API_TOKEN=your_api_token_here
PORT=3000
```

### 4. Run the Application

#### Development Mode (with hot reload)

```bash
npm run dev
```

#### Production Mode

Build and run:

```bash
npm run build
npm start
```

### 5. View the App

Open your browser and navigate to:

```
http://localhost:3000
```

## Usage Guide

### Switching Date Ranges

Use the navigation buttons at the top to switch between:
- **Current Week**: Monday to Sunday of the current week
- **Last Week**: Monday to Sunday of the previous week
- **Current Month**: First to last day of the current month
- **Last Month**: First to last day of the previous month

### Switching Views

Toggle between:
- **By Day**: See all projects for each day
- **By Project**: See all days for each project

### Copying Data

The app provides flexible copy functionality:

1. **Copy Time + Description (two-click)**:
   - Click once on a project/day card → time copied
   - Click again within 1 second → description copied
   - Use this to quickly paste time and then paste description

2. **Copy Time Only (single-click)**:
   - Click directly on the time badge (the colored hour display)
   - Copies just the decimal hour value (e.g., "3.50")

3. **Visual Feedback**:
   - A tooltip appears showing what was copied
   - "Time copied! Click again for description." or "Description copied!"

## Project Structure

```
toggl-time-summary/
├── src/
│   ├── index.ts           # Express server with route handling
│   ├── toggl-client.ts    # Toggl API v9 client
│   ├── date-utils.ts      # Date calculations & Swiss formatting
│   ├── aggregator.ts      # Time entry aggregation & organization
│   └── template.ts        # HTML rendering for both views
├── .env.example           # Example environment variables
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## How It Works

### 1. Toggl API Client (`toggl-client.ts`)

- Authenticates using Basic Auth with your API token
- Fetches time entries for a given date range
- Fetches project information to get project names
- Uses Toggl Track API v9 endpoints

### 2. Date Utilities (`date-utils.ts`)

- Calculates date ranges (current/last week, current/last month)
- Formats dates in Swiss style (DD.MM.YYYY)
- Extracts dates from ISO 8601 timestamps
- Handles local timezone conversions

### 3. Aggregation Logic (`aggregator.ts`)

Groups time entries by project and day, then for each group:

- **Description Processing**:
  - Filters out null/empty descriptions
  - Deduplicates identical descriptions
  - Concatenates with " / \n" separator
- **Duration Calculation**:
  - Sums all entry durations
  - Converts from seconds to hours
  - Rounds to 2 decimal places
- **Dual Organization**:
  - `organizeByDay()`: Groups by day, then project
  - `organizeByProject()`: Groups by project, then day

### 4. Server & Routes (`index.ts`)

- Express server handles query parameters:
  - `?range=current-week|last-week|current-month|last-month`
  - `?view=by-day|by-project`
- Fetches data from Toggl API
- Renders appropriate view based on query parameters

### 5. UI Templates (`template.ts`)

- Server-side HTML rendering with embedded JavaScript
- Two view renderers:
  - `renderDayView()`: Day-centric layout
  - `renderProjectView()`: Project-centric layout
- Copy functionality implemented with vanilla JavaScript
- Responsive CSS for mobile and desktop

## API Reference

### Toggl Track API v9

The app uses the following Toggl API endpoints:

- `GET /api/v9/me/time_entries` - Fetch time entries
  - Query params: `start_date`, `end_date` (YYYY-MM-DD)
- `GET /api/v9/me/projects` - Fetch all projects

Authentication: Basic Auth with API token as username and "api_token" as password.

More details: [Toggl API Documentation](https://developers.track.toggl.com/docs/)

## Example Screenshots

### By Day View
Shows each day as a section with project cards inside:
```
Monday - 15.01.2026                    7.75h total
┌──────────────────────────────────────────┐
│ Project Alpha               3.50h        │
│ Feature development / Bug fixes          │
└──────────────────────────────────────────┘
┌──────────────────────────────────────────┐
│ Project Beta                4.25h        │
│ Code review / Documentation              │
└──────────────────────────────────────────┘
```

### By Project View
Shows each project as a section with day entries inside:
```
Project Alpha                           15.25h total
┌──────────────────────────────────────────┐
│ Monday • 15.01.2026          3.50h       │
│ Feature development / Bug fixes          │
└──────────────────────────────────────────┘
┌──────────────────────────────────────────┐
│ Tuesday • 16.01.2026         4.75h       │
│ Code review / Testing                    │
└──────────────────────────────────────────┘
```

## Troubleshooting

### "Toggl API error (401)"

- Check that your `TOGGL_API_TOKEN` in `.env` is correct
- Verify you copied the token correctly (no extra spaces)

### "Failed to fetch time entries"

- Ensure you have internet connectivity
- Check that Toggl Track API is accessible
- Verify your API token has not expired

### No time entries showing

- Make sure you have time entries logged in the selected date range
- Check the date range in console logs
- Verify time entries have valid start/stop times (not running)

### Copy functionality not working

- Ensure your browser supports the Clipboard API
- Check browser console for JavaScript errors
- Try using a modern browser (Chrome, Firefox, Edge, Safari)

## Development

### Code Quality

The codebase follows these principles:

- **Separation of Concerns**: API client, business logic, and presentation are separate modules
- **Type Safety**: Full TypeScript with strict mode
- **Clarity**: Comments explain Toggl API usage and aggregation logic
- **Simplicity**: Minimal dependencies, no over-engineering

### Adding Custom Date Ranges

To add a custom date range option:

1. Add the range logic in `date-utils.ts` (e.g., `getLastQuarter()`)
2. Add the case in `index.ts` `getDateRange()` function
3. Add the button in `template.ts` `renderNavigation()` function

### Testing Locally

1. Make sure you have time entries in Toggl for your selected range
2. Run `npm run dev`
3. Open `http://localhost:3000`
4. Check the console for debug logs
5. Try different date ranges and views
6. Test the copy functionality

## License

ISC
