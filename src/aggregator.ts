/**
 * Time Entry Aggregation Logic
 *
 * Groups time entries by project and day, aggregates descriptions,
 * and calculates total durations.
 */

import { TogglTimeEntry, TogglProject } from './toggl-client';
import { extractDate } from './date-utils';

export interface ProjectDaySummary {
  projectId: number | null;
  projectName: string;
  date: string; // YYYY-MM-DD
  totalHours: number;
  descriptions: string; // Concatenated with " / \n" separator
}

export interface DaySummary {
  date: string;
  dayName: string;
  projects: ProjectDaySummary[];
}

export interface DayEntry {
  date: string; // YYYY-MM-DD
  dayName: string;
  totalHours: number;
  descriptions: string; // Concatenated with " / \n" separator
}

export interface ProjectSummary {
  projectId: number | null;
  projectName: string;
  days: DayEntry[];
  totalHours: number;
}

/**
 * Groups time entries by project ID and date
 * @param entries - Array of time entries
 * @returns Map with key format "projectId|date" pointing to array of entries
 */
function groupByProjectAndDay(
  entries: TogglTimeEntry[]
): Map<string, TogglTimeEntry[]> {
  const grouped = new Map<string, TogglTimeEntry[]>();

  for (const entry of entries) {
    // Skip entries that are still running (negative duration)
    if (entry.duration < 0) {
      continue;
    }

    const date = extractDate(entry.start);
    const projectId = entry.project_id ?? 'no-project';
    const key = `${projectId}|${date}`;

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(entry);
  }

  return grouped;
}

/**
 * Processes descriptions for a group of entries:
 * - Removes null/empty descriptions
 * - Deduplicates identical descriptions
 * - Joins with " / \n" separator
 * @param entries - Array of time entries
 * @returns Concatenated description string
 */
function processDescriptions(entries: TogglTimeEntry[]): string {
  // Extract descriptions, filter out null/empty, and deduplicate
  const descriptions = entries
    .map(e => e.description)
    .filter(desc => desc !== null && desc.trim() !== '')
    .filter((desc, index, self) => self.indexOf(desc) === index); // Deduplicate

  return descriptions.join(' / \n');
}

/**
 * Calculates total duration in hours for a group of entries
 * @param entries - Array of time entries
 * @returns Total duration in hours (2 decimal places)
 */
function calculateTotalHours(entries: TogglTimeEntry[]): number {
  const totalSeconds = entries.reduce((sum, entry) => sum + entry.duration, 0);
  const hours = totalSeconds / 3600;
  return Math.round(hours * 100) / 100; // Round to 2 decimal places
}

/**
 * Aggregates time entries into project-day summaries
 * @param entries - Array of time entries
 * @param projectsMap - Map of project IDs to project details
 * @returns Array of ProjectDaySummary objects
 */
export function aggregateTimeEntries(
  entries: TogglTimeEntry[],
  projectsMap: Map<number, TogglProject>
): ProjectDaySummary[] {
  const grouped = groupByProjectAndDay(entries);
  const summaries: ProjectDaySummary[] = [];

  for (const [key, groupedEntries] of grouped) {
    const [projectIdStr, date] = key.split('|');
    const projectId = projectIdStr === 'no-project' ? null : parseInt(projectIdStr, 10);

    // Get project name from map, or use default
    let projectName = 'No Project';
    if (projectId !== null && projectsMap.has(projectId)) {
      projectName = projectsMap.get(projectId)!.name;
    }

    summaries.push({
      projectId,
      projectName,
      date,
      totalHours: calculateTotalHours(groupedEntries),
      descriptions: processDescriptions(groupedEntries),
    });
  }

  return summaries;
}

/**
 * Organizes project summaries by day
 * @param summaries - Array of ProjectDaySummary objects
 * @param allDates - Array of all dates in the week (YYYY-MM-DD format)
 * @param dayNames - Map of date to day name
 * @returns Array of DaySummary objects, sorted by date
 */
export function organizeByDay(
  summaries: ProjectDaySummary[],
  allDates: string[],
  dayNames: Map<string, string>
): DaySummary[] {
  const daySummaries: DaySummary[] = [];

  for (const date of allDates) {
    const projectsForDay = summaries
      .filter(s => s.date === date)
      .sort((a, b) => a.projectName.localeCompare(b.projectName));

    daySummaries.push({
      date,
      dayName: dayNames.get(date) || '',
      projects: projectsForDay,
    });
  }

  return daySummaries;
}

/**
 * Organizes project summaries by project (showing days within each project)
 * @param summaries - Array of ProjectDaySummary objects
 * @param allDates - Array of all dates in the range (YYYY-MM-DD format)
 * @param dayNames - Map of date to day name
 * @returns Array of ProjectSummary objects, sorted by project name
 */
export function organizeByProject(
  summaries: ProjectDaySummary[],
  allDates: string[],
  dayNames: Map<string, string>
): ProjectSummary[] {
  // Group by project
  const projectMap = new Map<string, ProjectDaySummary[]>();

  for (const summary of summaries) {
    const key = `${summary.projectId}|${summary.projectName}`;
    if (!projectMap.has(key)) {
      projectMap.set(key, []);
    }
    projectMap.get(key)!.push(summary);
  }

  // Build project summaries
  const projectSummaries: ProjectSummary[] = [];

  for (const [key, projectDays] of projectMap) {
    const [projectIdStr, projectName] = key.split('|');
    const projectId = projectIdStr === 'null' ? null : parseInt(projectIdStr, 10);

    // Sort days by date
    const days: DayEntry[] = projectDays
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(pd => ({
        date: pd.date,
        dayName: dayNames.get(pd.date) || '',
        totalHours: pd.totalHours,
        descriptions: pd.descriptions,
      }));

    const totalHours = days.reduce((sum, day) => sum + day.totalHours, 0);

    projectSummaries.push({
      projectId,
      projectName,
      days,
      totalHours: Math.round(totalHours * 100) / 100,
    });
  }

  // Sort by project name
  return projectSummaries.sort((a, b) => a.projectName.localeCompare(b.projectName));
}
