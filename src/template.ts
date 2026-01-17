/**
 * HTML Template Rendering
 *
 * Generates the HTML UI for displaying time entry summaries.
 */

import { DaySummary, ProjectSummary } from './aggregator';
import { DateRange, toSwissFormat } from './date-utils';
import { ParsedQs } from 'qs';

/**
 * Escapes HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, char => map[char]);
}

/**
 * Builds query string from current query params
 */
function buildQueryString(params: ParsedQs, overrides: Record<string, string>): string {
  const merged = { ...params, ...overrides };
  const parts: string[] = [];

  for (const [key, value] of Object.entries(merged)) {
    if (value) {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }

  return parts.length > 0 ? '?' + parts.join('&') : '';
}

/**
 * Renders the navigation bar with date range selector and view toggle
 */
function renderNavigation(currentRange: string, currentView: string, queryParams: ParsedQs): string {
  const ranges = [
    { value: 'current-week', label: 'Current Week' },
    { value: 'last-week', label: 'Last Week' },
    { value: 'current-month', label: 'Current Month' },
    { value: 'last-month', label: 'Last Month' },
  ];

  const rangeButtons = ranges.map(r => {
    const isActive = currentRange === r.value;
    const qs = buildQueryString(queryParams, { range: r.value, view: currentView });
    return `<a href="${qs}" class="nav-btn ${isActive ? 'active' : ''}">${r.label}</a>`;
  }).join('');

  // View toggle
  const viewByDay = currentView === 'by-day';
  const viewByProject = currentView === 'by-project';
  const dayQs = buildQueryString(queryParams, { view: 'by-day' });
  const projectQs = buildQueryString(queryParams, { view: 'by-project' });

  return `
    <div class="navigation">
      <div class="nav-section">
        <label class="nav-label">Date Range:</label>
        <div class="nav-buttons">
          ${rangeButtons}
        </div>
      </div>
      <div class="nav-section">
        <label class="nav-label">View:</label>
        <div class="nav-buttons">
          <a href="${dayQs}" class="nav-btn ${viewByDay ? 'active' : ''}">By Day</a>
          <a href="${projectQs}" class="nav-btn ${viewByProject ? 'active' : ''}">By Project</a>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renders the copy functionality JavaScript
 */
function renderCopyScript(): string {
  return `
    <script>
      // Copy functionality with click counter
      const clickState = new Map(); // Map of element ID to { count, timeout, time, description }

      function setupCopyListeners() {
        // For project cards in day view
        document.querySelectorAll('.project-card').forEach(card => {
          card.addEventListener('click', function(e) {
            const time = this.dataset.time;
            const description = this.dataset.description;
            handleCopy(this.dataset.id, time, description);
          });
        });

        // For time badges (click only on time to copy decimal)
        document.querySelectorAll('.project-hours, .day-entry-hours').forEach(badge => {
          badge.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent parent card click
            const time = this.dataset.time;
            copyToClipboard(time);
            showCopyFeedback(this, 'Time copied!');
          });
        });

        // For day entries in project view
        document.querySelectorAll('.day-entry').forEach(entry => {
          entry.addEventListener('click', function(e) {
            const time = this.dataset.time;
            const description = this.dataset.description;
            handleCopy(this.dataset.id, time, description);
          });
        });
      }

      function handleCopy(elementId, time, description) {
        const now = Date.now();
        const state = clickState.get(elementId);

        // Clear existing timeout
        if (state && state.timeout) {
          clearTimeout(state.timeout);
        }

        // Check if this is a second click within 1 second
        if (state && (now - state.lastClick) < 1000) {
          // Second click: copy time
          copyToClipboard(time);
          const element = document.querySelector(\`[data-id="\${elementId}"]\`);
          showCopyFeedback(element, 'Time copied!');

        } else {
          // First click: copy description
          copyToClipboard(description);
          const element = document.querySelector(\`[data-id="\${elementId}"]\`);
          showCopyFeedback(element, 'Description copied!');
          clickState.delete(elementId);

          // Set timeout to reset click state
          const timeout = setTimeout(() => {
            clickState.delete(elementId);
          }, 1000);

          clickState.set(elementId, {
            lastClick: now,
            timeout: timeout,
          });
        }
      }

      function copyToClipboard(text) {
        if (!text) return;

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).catch(err => {
            console.error('Failed to copy:', err);
            fallbackCopy(text);
          });
        } else {
          fallbackCopy(text);
        }
      }

      function fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Fallback copy failed:', err);
        }
        document.body.removeChild(textarea);
      }

      function showCopyFeedback(element, message) {
        if (!element) return;

        // Remove existing feedback
        const existing = element.querySelector('.copy-feedback');
        if (existing) {
          existing.remove();
        }

        // Create feedback element
        const feedback = document.createElement('div');
        feedback.className = 'copy-feedback';
        feedback.textContent = message;
        element.style.position = 'relative';
        element.appendChild(feedback);

        // Fade out and remove
        setTimeout(() => {
          feedback.style.opacity = '0';
          setTimeout(() => feedback.remove(), 300);
        }, 1500);
      }

      // Initialize on page load
      document.addEventListener('DOMContentLoaded', setupCopyListeners);
    </script>
  `;
}

/**
 * Renders common styles
 */
function renderStyles(): string {
  return `
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        background: #f5f5f5;
        color: #333;
        line-height: 1.6;
        padding: 20px;
      }

      .container {
        max-width: 1000px;
        margin: 0 auto;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }

      .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px;
      }

      .header h1 {
        font-size: 28px;
        font-weight: 600;
        margin-bottom: 8px;
      }

      .header .subtitle {
        opacity: 0.9;
        font-size: 14px;
      }

      .navigation {
        background: #f9fafb;
        border-bottom: 1px solid #e5e7eb;
        padding: 20px 30px;
      }

      .nav-section {
        margin-bottom: 15px;
      }

      .nav-section:last-child {
        margin-bottom: 0;
      }

      .nav-label {
        display: block;
        font-size: 12px;
        font-weight: 600;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 8px;
      }

      .nav-buttons {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .nav-btn {
        display: inline-block;
        padding: 8px 16px;
        background: white;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        color: #374151;
        text-decoration: none;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s;
        cursor: pointer;
      }

      .nav-btn:hover {
        background: #f3f4f6;
        border-color: #667eea;
        color: #667eea;
      }

      .nav-btn.active {
        background: #667eea;
        border-color: #667eea;
        color: white;
      }

      .week-summary {
        background: #f9fafb;
        border-bottom: 1px solid #e5e7eb;
        padding: 20px 30px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .week-summary .week-range {
        font-size: 14px;
        color: #6b7280;
      }

      .week-summary .week-total {
        font-size: 18px;
        font-weight: 600;
        color: #667eea;
      }

      .content {
        padding: 30px;
      }

      .day-section, .project-section {
        margin-bottom: 30px;
      }

      .day-section:last-child, .project-section:last-child {
        margin-bottom: 0;
      }

      .day-header, .project-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 2px solid #e5e7eb;
      }

      .day-name, .project-name-header {
        font-size: 20px;
        font-weight: 600;
        color: #1f2937;
      }

      .day-meta, .project-meta {
        display: flex;
        gap: 16px;
        align-items: baseline;
      }

      .day-date {
        font-size: 14px;
        color: #6b7280;
      }

      .day-total, .project-total-header {
        font-size: 14px;
        font-weight: 600;
        color: #667eea;
      }

      .no-entries {
        color: #9ca3af;
        font-style: italic;
        padding: 20px;
        text-align: center;
      }

      .projects-container, .days-container {
        display: grid;
        gap: 12px;
      }

      .project-card, .day-entry {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        padding: 16px;
        transition: all 0.2s;
        cursor: pointer;
        position: relative;
      }

      .project-card:hover, .day-entry:hover {
        border-color: #667eea;
        box-shadow: 0 2px 4px rgba(102, 126, 234, 0.1);
        background: #fefefe;
      }

      .project-header-row, .day-entry-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 8px;
      }

      .project-name, .day-entry-day {
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
      }

      .project-hours, .day-entry-hours {
        font-size: 15px;
        font-weight: 600;
        color: #667eea;
        background: #eef2ff;
        padding: 4px 10px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .project-hours:hover, .day-entry-hours:hover {
        background: #ddd6fe;
        transform: scale(1.05);
      }

      .project-descriptions, .day-entry-descriptions {
        font-size: 14px;
        color: #6b7280;
        line-height: 1.6;
        white-space: pre-line;
      }

      .copy-feedback {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.85);
        color: white;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        pointer-events: none;
        z-index: 1000;
        transition: opacity 0.3s;
        white-space: nowrap;
      }

      .footer {
        background: #f9fafb;
        border-top: 1px solid #e5e7eb;
        padding: 16px 30px;
        text-align: center;
        font-size: 13px;
        color: #9ca3af;
      }

      @media (max-width: 640px) {
        body {
          padding: 0;
        }

        .container {
          border-radius: 0;
        }

        .header, .content {
          padding: 20px;
        }

        .navigation {
          padding: 15px 20px;
        }

        .week-summary {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }

        .day-header, .project-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
        }

        .day-meta, .project-meta {
          width: 100%;
          justify-content: space-between;
        }

        .nav-buttons {
          gap: 6px;
        }

        .nav-btn {
          padding: 6px 12px;
          font-size: 13px;
        }
      }
    </style>
  `;
}

/**
 * Renders a project card for the day view
 */
function renderProjectCard(
  projectName: string,
  totalHours: number,
  descriptions: string,
  cardId: string
): string {
  const escapedDesc = escapeHtml(descriptions);
  return `
    <div class="project-card" data-id="${cardId}" data-time="${totalHours.toFixed(2)}" data-description="${escapedDesc}">
      <div class="project-header-row">
        <h3 class="project-name">${escapeHtml(projectName)}</h3>
        <span class="project-hours" data-time="${totalHours.toFixed(2)}">${totalHours.toFixed(2)}h</span>
      </div>
      ${descriptions ? `<p class="project-descriptions">${escapedDesc}</p>` : ''}
    </div>
  `;
}

/**
 * Renders a day section for the day view
 */
function renderDaySection(daySummary: DaySummary): string {
  const { date, dayName, projects } = daySummary;
  const swissDate = toSwissFormat(date);

  if (projects.length === 0) {
    return `
      <div class="day-section">
        <div class="day-header">
          <h2 class="day-name">${dayName}</h2>
          <span class="day-date">${swissDate}</span>
        </div>
        <p class="no-entries">No time entries</p>
      </div>
    `;
  }

  const totalDayHours = projects.reduce((sum, p) => sum + p.totalHours, 0);
  const projectCards = projects.map((p, idx) =>
    renderProjectCard(p.projectName, p.totalHours, p.descriptions, `day-${date}-project-${idx}`)
  ).join('');

  return `
    <div class="day-section">
      <div class="day-header">
        <h2 class="day-name">${dayName}</h2>
        <div class="day-meta">
          <span class="day-date">${swissDate}</span>
          <span class="day-total">${totalDayHours.toFixed(2)}h total</span>
        </div>
      </div>
      <div class="projects-container">
        ${projectCards}
      </div>
    </div>
  `;
}

/**
 * Renders a day entry for the project view
 */
function renderDayEntry(
  dayName: string,
  date: string,
  totalHours: number,
  descriptions: string,
  entryId: string
): string {
  const swissDate = toSwissFormat(date);
  const escapedDesc = escapeHtml(descriptions);
  return `
    <div class="day-entry" data-id="${entryId}" data-time="${totalHours.toFixed(2)}" data-description="${escapedDesc}">
      <div class="day-entry-header">
        <div>
          <span class="day-entry-day">${dayName}</span>
          <span class="day-date"> • ${swissDate}</span>
        </div>
        <span class="day-entry-hours" data-time="${totalHours.toFixed(2)}">${totalHours.toFixed(2)}h</span>
      </div>
      ${descriptions ? `<p class="day-entry-descriptions">${escapedDesc}</p>` : ''}
    </div>
  `;
}

/**
 * Renders a project section for the project view
 */
function renderProjectSection(projectSummary: ProjectSummary): string {
  const { projectName, days, totalHours } = projectSummary;

  if (days.length === 0) {
    return `
      <div class="project-section">
        <div class="project-header">
          <h2 class="project-name-header">${escapeHtml(projectName)}</h2>
          <span class="project-total-header">0.00h total</span>
        </div>
        <p class="no-entries">No time entries</p>
      </div>
    `;
  }

  const dayEntries = days.map((d, idx) =>
    renderDayEntry(d.dayName, d.date, d.totalHours, d.descriptions, `project-${projectName}-day-${idx}`)
  ).join('');

  return `
    <div class="project-section">
      <div class="project-header">
        <h2 class="project-name-header">${escapeHtml(projectName)}</h2>
        <span class="project-total-header">${totalHours.toFixed(2)}h total</span>
      </div>
      <div class="days-container">
        ${dayEntries}
      </div>
    </div>
  `;
}

/**
 * Renders the day view HTML page
 */
export function renderDayView(
  daySummaries: DaySummary[],
  dateRange: DateRange,
  rangeLabel: string,
  queryParams: ParsedQs
): string {
  const daySections = daySummaries.map(renderDaySection).join('');
  const swissStart = toSwissFormat(dateRange.start);
  const swissEnd = toSwissFormat(dateRange.end);

  // Calculate total
  const weekTotal = daySummaries.reduce((sum, day) =>
    sum + day.projects.reduce((daySum, p) => daySum + p.totalHours, 0), 0
  );

  const currentRange = (queryParams.range as string) || 'last-week';
  const navigation = renderNavigation(currentRange, 'by-day', queryParams);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Toggl Time Summary - By Day</title>
  ${renderStyles()}
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Toggl Time Summary</h1>
      <div class="subtitle">${rangeLabel}</div>
    </div>

    ${navigation}

    <div class="week-summary">
      <div class="week-range">${swissStart} to ${swissEnd}</div>
      <div class="week-total">${weekTotal.toFixed(2)}h total</div>
    </div>

    <div class="content">
      ${daySections}
    </div>

    <div class="footer">
      Click on a card to copy time, click again to copy description • Click only on time badge to copy decimal hours
    </div>
  </div>

  ${renderCopyScript()}
</body>
</html>
  `;
}

/**
 * Renders the project view HTML page
 */
export function renderProjectView(
  projectSummaries: ProjectSummary[],
  dateRange: DateRange,
  rangeLabel: string,
  queryParams: ParsedQs
): string {
  const projectSections = projectSummaries.map(renderProjectSection).join('');
  const swissStart = toSwissFormat(dateRange.start);
  const swissEnd = toSwissFormat(dateRange.end);

  // Calculate total
  const total = projectSummaries.reduce((sum, project) => sum + project.totalHours, 0);

  const currentRange = (queryParams.range as string) || 'last-week';
  const navigation = renderNavigation(currentRange, 'by-project', queryParams);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Toggl Time Summary - By Project</title>
  ${renderStyles()}
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Toggl Time Summary</h1>
      <div class="subtitle">${rangeLabel}</div>
    </div>

    ${navigation}

    <div class="week-summary">
      <div class="week-range">${swissStart} to ${swissEnd}</div>
      <div class="week-total">${total.toFixed(2)}h total</div>
    </div>

    <div class="content">
      ${projectSections}
    </div>

    <div class="footer">
      Click on a card to copy time, click again to copy description • Click only on time badge to copy decimal hours
    </div>
  </div>

  ${renderCopyScript()}
</body>
</html>
  `;
}
