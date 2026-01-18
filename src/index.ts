/**
 * Main Express Server
 *
 * Provides backend API endpoints that proxy calls to Toggl API
 * This solves CORS issues with direct browser -> Toggl API calls
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { renderClientSideApp } from './client-side-app';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable JSON parsing
app.use(express.json());

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Toggl-Api-Token');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

/**
 * Helper function to call Toggl API with user's token
 */
async function callTogglApi(endpoint: string, apiToken: string): Promise<any> {
  const credentials = Buffer.from(`${apiToken}:api_token`).toString('base64');

  const response = await fetch(`https://api.track.toggl.com/api/v9${endpoint}`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Toggl API error (${response.status}): ${errorText}`);
  }

  return await response.json();
}

/**
 * API Endpoint: Fetch time entries
 * Proxies the request to Toggl API to avoid CORS issues
 */
app.get('/api/time-entries', async (req: Request, res: Response) => {
  try {
    // Get API token from header
    const apiToken = req.headers['x-toggl-api-token'] as string;

    if (!apiToken) {
      return res.status(401).json({ error: 'API token required in X-Toggl-Api-Token header' });
    }

    // Get query parameters
    const startDate = req.query.start_date as string;
    const endDate = req.query.end_date as string;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'start_date and end_date query parameters required' });
    }

    // Call Toggl API
    const data = await callTogglApi(`/me/time_entries?start_date=${startDate}&end_date=${endDate}`, apiToken);

    res.json(data);
  } catch (error) {
    console.error('Error fetching time entries:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * API Endpoint: Fetch projects
 * Proxies the request to Toggl API to avoid CORS issues
 */
app.get('/api/projects', async (req: Request, res: Response) => {
  try {
    // Get API token from header
    const apiToken = req.headers['x-toggl-api-token'] as string;

    if (!apiToken) {
      return res.status(401).json({ error: 'API token required in X-Toggl-Api-Token header' });
    }

    // Call Toggl API
    const data = await callTogglApi('/me/projects', apiToken);

    res.json(data);
  } catch (error) {
    console.error('Error fetching projects:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * Main route - serves the client-side app
 */
app.get('/', async (req: Request, res: Response) => {
  const html = renderClientSideApp();
  return res.send(html);
});

/**
 * Health check endpoint
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    mode: 'backend-proxy'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`🔄 Backend proxy mode: Solving CORS issues with Toggl API`);
  console.log(`📊 View your Toggl time summary in your browser\n`);
});
