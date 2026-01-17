/**
 * Main Express Server
 *
 * Sets up the HTTP server and routes for the Toggl time summary app.
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { TogglClient } from './toggl-client';
import {
  getLastCalendarWeek,
  getCurrentCalendarWeek,
  getCurrentMonth,
  getLastMonth,
  getDatesInRange,
  getDayName,
  DateRange,
} from './date-utils';
import { aggregateTimeEntries, organizeByDay, organizeByProject } from './aggregator';
import { renderDayView, renderProjectView } from './template';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Validate environment variables
const TOGGL_API_TOKEN = process.env.TOGGL_API_TOKEN;
if (!TOGGL_API_TOKEN) {
  console.error('Error: TOGGL_API_TOKEN environment variable is not set');
  console.error('Please create a .env file with your Toggl API token');
  process.exit(1);
}

// Initialize Toggl client
const togglClient = new TogglClient(TOGGL_API_TOKEN);

/**
 * Gets the date range based on query parameters
 */
function getDateRange(req: Request): { dateRange: DateRange; rangeLabel: string } {
  const range = req.query.range as string || 'last-week';
  const customStart = req.query.start as string;
  const customEnd = req.query.end as string;

  let dateRange: DateRange;
  let rangeLabel: string;

  switch (range) {
    case 'current-week':
      dateRange = getCurrentCalendarWeek();
      rangeLabel = 'Current Week';
      break;
    case 'current-month':
      dateRange = getCurrentMonth();
      rangeLabel = 'Current Month';
      break;
    case 'last-month':
      dateRange = getLastMonth();
      rangeLabel = 'Last Month';
      break;
    case 'custom':
      if (customStart && customEnd) {
        dateRange = { start: customStart, end: customEnd };
        rangeLabel = 'Custom Range';
      } else {
        // Default to last week if custom dates not provided
        dateRange = getLastCalendarWeek();
        rangeLabel = 'Last Week';
      }
      break;
    case 'last-week':
    default:
      dateRange = getLastCalendarWeek();
      rangeLabel = 'Last Week';
      break;
  }

  return { dateRange, rangeLabel };
}

/**
 * Main route - fetches, aggregates, and displays time entries
 */
app.get('/', async (req: Request, res: Response) => {
  try {
    const view = req.query.view as string || 'by-day';
    const { dateRange, rangeLabel } = getDateRange(req);

    console.log(`Fetching time entries from ${dateRange.start} to ${dateRange.end}`);

    // Fetch time entries from Toggl
    const timeEntries = await togglClient.fetchTimeEntries(dateRange.start, dateRange.end);
    console.log(`Fetched ${timeEntries.length} time entries`);

    // Fetch all projects to get project names
    const projects = await togglClient.fetchAllProjects();
    const projectsMap = new Map(projects.map(p => [p.id, p]));
    console.log(`Fetched ${projects.length} projects`);

    // Aggregate time entries by project and day
    const summaries = aggregateTimeEntries(timeEntries, projectsMap);

    // Get all dates in the range
    const allDates = getDatesInRange(dateRange.start, dateRange.end);
    const dayNames = new Map(allDates.map(date => [date, getDayName(date)]));

    // Render based on view type
    let html: string;
    if (view === 'by-project') {
      const projectSummaries = organizeByProject(summaries, allDates, dayNames);
      html = renderProjectView(projectSummaries, dateRange, rangeLabel, req.query);
    } else {
      const daySummaries = organizeByDay(summaries, allDates, dayNames);
      html = renderDayView(daySummaries, dateRange, rangeLabel, req.query);
    }

    res.send(html);
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
          }
          .error {
            background: #fee;
            border: 1px solid #fcc;
            border-radius: 4px;
            padding: 20px;
          }
          h1 { color: #c33; }
          code {
            background: #f5f5f5;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: monospace;
          }
        </style>
      </head>
      <body>
        <div class="error">
          <h1>Error</h1>
          <p>${errorMessage}</p>
          <p>Please check:</p>
          <ul>
            <li>Your <code>TOGGL_API_TOKEN</code> is valid</li>
            <li>You have internet connectivity</li>
            <li>The Toggl API is accessible</li>
          </ul>
        </div>
      </body>
      </html>
    `);
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`📊 View your Toggl time summary in your browser\n`);
});
