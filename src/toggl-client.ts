/**
 * Toggl Track API v9 Client
 *
 * Handles authentication and fetching of time entries from Toggl Track API.
 * API Documentation: https://developers.track.toggl.com/docs/
 */

export interface TogglTimeEntry {
  id: number;
  workspace_id: number;
  project_id: number | null;
  task_id: number | null;
  billable: boolean;
  start: string; // ISO 8601 datetime
  stop: string | null; // ISO 8601 datetime
  duration: number; // Duration in seconds (negative if timer is running)
  description: string | null;
  tags: string[] | null;
  tag_ids: number[] | null;
  duronly: boolean;
  at: string; // Last update timestamp
  server_deleted_at: string | null;
  user_id: number;
  uid: number;
  wid: number;
  pid: number | null;
}

export interface TogglProject {
  id: number;
  workspace_id: number;
  name: string;
  active: boolean;
  color: string;
}

export class TogglClient {
  private apiToken: string;
  private baseUrl = 'https://api.track.toggl.com/api/v9';

  constructor(apiToken: string) {
    if (!apiToken) {
      throw new Error('Toggl API token is required');
    }
    this.apiToken = apiToken;
  }

  /**
   * Creates Basic Auth header for Toggl API
   * Toggl uses the API token as username and 'api_token' as password
   */
  private getAuthHeader(): string {
    const credentials = Buffer.from(`${this.apiToken}:api_token`).toString('base64');
    return `Basic ${credentials}`;
  }

  /**
   * Fetches time entries for a given date range
   * @param startDate - Start date in ISO format (YYYY-MM-DD)
   * @param endDate - End date in ISO format (YYYY-MM-DD)
   * @returns Array of time entries
   */
  async fetchTimeEntries(startDate: string, endDate: string): Promise<TogglTimeEntry[]> {
    const url = `${this.baseUrl}/me/time_entries?start_date=${startDate}&end_date=${endDate}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Toggl API error (${response.status}): ${errorText}`);
      }

      const entries: TogglTimeEntry[] = await response.json();
      return entries;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch time entries: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Fetches project details by project ID
   * @param projectId - The project ID
   * @returns Project details
   */
  async fetchProject(projectId: number): Promise<TogglProject> {
    const url = `${this.baseUrl}/me/projects/${projectId}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Toggl API error (${response.status}): ${errorText}`);
      }

      const project: TogglProject = await response.json();
      return project;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch project: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Fetches all projects for the authenticated user
   * @returns Array of projects
   */
  async fetchAllProjects(): Promise<TogglProject[]> {
    const url = `${this.baseUrl}/me/projects`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Toggl API error (${response.status}): ${errorText}`);
      }

      const projects: TogglProject[] = await response.json();
      return projects;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch projects: ${error.message}`);
      }
      throw error;
    }
  }
}
