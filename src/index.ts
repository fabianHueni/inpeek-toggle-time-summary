/**
 * Main Express Server
 *
 * Sets up the HTTP server and routes for the Toggl time summary app.
 * Client-side mode: Users provide their own API tokens (multi-user)
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { renderClientSideApp } from './client-side-app';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable JSON parsing for future API endpoints
app.use(express.json());

/**
 * Main route - fetches, aggregates, and displays time entries
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
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`👥 Multi-user mode: Users can enter their own Toggl API tokens`);
  console.log(`📊 View your Toggl time summary in your browser\n`);
});
