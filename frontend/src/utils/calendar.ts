/**
 * Calendar export utilities - ICS file generation & Google Calendar URL builder
 */

interface CalendarEvent {
  title: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate: Date;
}

/**
 * Format a Date to ICS datetime format (YYYYMMDDTHHmmssZ)
 */
const formatICSDate = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
};

/**
 * Generate ICS file content for a calendar event
 */
export const generateICSContent = (event: CalendarEvent): string => {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wedding Guest Portal//EN',
    'BEGIN:VEVENT',
    `DTSTART:${formatICSDate(event.startDate)}`,
    `DTEND:${formatICSDate(event.endDate)}`,
    `SUMMARY:${event.title}`,
  ];

  if (event.description) {
    lines.push(`DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`);
  }
  if (event.location) {
    lines.push(`LOCATION:${event.location}`);
  }

  lines.push(`UID:${Date.now()}-${Math.random().toString(36).slice(2)}@wedding`);
  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
};

/**
 * Download an ICS file for a calendar event
 */
export const downloadICS = (event: CalendarEvent): void => {
  const content = generateICSContent(event);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Build a Google Calendar URL for the event
 */
export const getGoogleCalendarUrl = (event: CalendarEvent): string => {
  const formatGoogleDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatGoogleDate(event.startDate)}/${formatGoogleDate(event.endDate)}`,
  });

  if (event.description) {
    params.set('details', event.description);
  }
  if (event.location) {
    params.set('location', event.location);
  }

  return `https://www.google.com/calendar/render?${params.toString()}`;
};

/**
 * Build a CalendarEvent from activity data fields
 */
export const buildCalendarEvent = (activity: {
  title?: string;
  activity_name?: string;
  description?: string;
  location?: string;
  activity_date?: string;
  date_time?: string;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
}): CalendarEvent | null => {
  const title = activity.title || activity.activity_name || 'Wedding Event';

  // Determine the start date
  let startDate: Date | null = null;

  if (activity.date_time) {
    startDate = new Date(activity.date_time);
  } else if (activity.activity_date && activity.start_time) {
    startDate = new Date(`${activity.activity_date}T${activity.start_time}`);
  } else if (activity.activity_date) {
    startDate = new Date(`${activity.activity_date}T00:00:00`);
  }

  if (!startDate || isNaN(startDate.getTime())) return null;

  // Determine the end date
  let endDate: Date;

  if (activity.activity_date && activity.end_time) {
    endDate = new Date(`${activity.activity_date}T${activity.end_time}`);
  } else if (activity.duration_minutes) {
    endDate = new Date(startDate.getTime() + activity.duration_minutes * 60 * 1000);
  } else {
    // Default to 2 hours
    endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
  }

  return {
    title,
    description: activity.description,
    location: activity.location,
    startDate,
    endDate,
  };
};
