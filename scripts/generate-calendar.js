#!/usr/bin/env node
/**
 * Generate events.ics from events.json
 * This script creates a static ICS calendar file that can be subscribed to
 */

const fs = require('fs');
const path = require('path');

// Read events.json
const eventsPath = path.join(__dirname, '../data/events.json');
const eventsData = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));
const events = eventsData.events;

// Event type labels
const eventTypes = {
    race: 'Race',
    event: 'Event',
    training: 'Training',
    meeting: 'Meeting',
    emergency: 'Emergency'
};

// Format date as YYYYMMDD for all-day events
function formatICSDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

// Format date and time as YYYYMMDDTHHMMSS for timed events
function formatICSDateTime(dateString, timeString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const [hours, minutes] = timeString.split(':');
    return `${year}${month}${day}T${hours}${minutes}00`;
}

// Escape special characters for ICS format
function escapeICSText(text) {
    if (!text) return '';
    return text.replace(/\\/g, '\\\\')
                .replace(/;/g, '\\;')
                .replace(/,/g, '\\,')
                .replace(/\n/g, '\\n');
}

// Generate timestamp
function getTimestamp() {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

// Generate ICS content
function generateICS() {
    const timestamp = getTimestamp();

    let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Atlanta Ham Radio//Events//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:Atlanta Ham Radio Events',
        'X-WR-CALDESC:Amateur radio public service events in the Atlanta metro area',
        'X-WR-TIMEZONE:America/New_York',
        'REFRESH-INTERVAL;VALUE=DURATION:PT12H',
        'X-PUBLISHED-TTL:PT12H',
        'BEGIN:VTIMEZONE',
        'TZID:America/New_York',
        'BEGIN:DAYLIGHT',
        'TZOFFSETFROM:-0500',
        'TZOFFSETTO:-0400',
        'TZNAME:EDT',
        'DTSTART:19700308T020000',
        'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU',
        'END:DAYLIGHT',
        'BEGIN:STANDARD',
        'TZOFFSETFROM:-0400',
        'TZOFFSETTO:-0500',
        'TZNAME:EST',
        'DTSTART:19701101T020000',
        'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU',
        'END:STANDARD',
        'END:VTIMEZONE'
    ].join('\r\n') + '\r\n';

    events.forEach(event => {
        const description = escapeICSText(event.description || '');
        const category = eventTypes[event.type] || 'Event';

        // Determine if this is a timed event or all-day event
        // Multi-day events are ALWAYS all-day, regardless of time fields
        const isMultiDay = !!event.endDate;
        const hasTime = event.startTime && event.endTime && !isMultiDay;

        let dtstart, dtend;

        if (hasTime) {
            // Timed event (single-day only)
            dtstart = `DTSTART;TZID=America/New_York:${formatICSDateTime(event.date, event.startTime)}`;
            dtend = `DTEND;TZID=America/New_York:${formatICSDateTime(event.date, event.endTime)}`;
        } else {
            // All-day event (multi-day or no time specified)
            const startDate = formatICSDate(event.date);
            const endDateObj = event.endDate ? new Date(event.endDate) : new Date(event.date);
            endDateObj.setDate(endDateObj.getDate() + 1);
            const endDate = formatICSDate(endDateObj);
            dtstart = `DTSTART;VALUE=DATE:${startDate}`;
            dtend = `DTEND;VALUE=DATE:${endDate}`;
        }

        icsContent += [
            'BEGIN:VEVENT',
            `UID:event-${event.id}@atlantahamradio.org`,
            `DTSTAMP:${timestamp}`,
            dtstart,
            dtend,
            `SUMMARY:${escapeICSText(event.title)}`,
            `LOCATION:${escapeICSText(event.location)}`,
            description ? `DESCRIPTION:${description}` : '',
            event.contact ? `URL:${event.contact}` : '',
            `CATEGORIES:${category}`,
            'STATUS:CONFIRMED',
            'TRANSP:TRANSPARENT',
            'END:VEVENT'
        ].filter(line => line).join('\r\n') + '\r\n';
    });

    icsContent += 'END:VCALENDAR';
    return icsContent;
}

// Write ICS file
const icsContent = generateICS();
const outputPath = path.join(__dirname, '../events.ics');
fs.writeFileSync(outputPath, icsContent, 'utf8');

console.log(`✓ Generated events.ics with ${events.length} events`);
console.log(`✓ File location: ${outputPath}`);
