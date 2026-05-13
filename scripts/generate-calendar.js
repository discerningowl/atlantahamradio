#!/usr/bin/env node
/**
 * Generate events.ics from events.json
 * This script creates a static ICS calendar file that can be subscribed to.
 * Run automatically via GitHub Actions when events.json changes.
 */

const fs = require('fs');
const path = require('path');

// Read events.json
const eventsPath = path.join(__dirname, '../data/events.json');
const eventsData = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));
const events = eventsData.events;

// Event type labels for CATEGORIES field
const eventTypes = {
    'public-service': 'Public Service',
    'activity':       'Ham Activity',
    'meeting':        'Meeting',
    'training':       'Training'
};

// Format YYYYMMDD from a YYYY-MM-DD string, parsed as local time
// (avoids UTC midnight → previous day bug with new Date(string))
function formatICSDate(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);
    return `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`;
}

// Format YYYYMMDDTHHMMSS from a YYYY-MM-DD string and HH:MM time string
function formatICSDateTime(dateString, timeString) {
    const [year, month, day] = dateString.split('-').map(Number);
    const [hours, minutes] = timeString.split(':');
    return `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}T${hours}${minutes}00`;
}

// Format YYYYMMDD from a Date object (local time)
function formatICSDateObj(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

// Escape special characters for ICS format
function escapeICSText(text) {
    if (!text) return '';
    return text.replace(/\\/g, '\\\\')
                .replace(/;/g, '\\;')
                .replace(/,/g, '\\,')
                .replace(/\n/g, '\\n');
}

// RFC 5545 §3.1 line folding: lines must not exceed 75 octets.
// Long lines are broken with CRLF + single space (continuation character).
function foldLine(line) {
    if (Buffer.byteLength(line, 'utf8') <= 75) return line;
    let result = '';
    let remaining = line;
    while (Buffer.byteLength(remaining, 'utf8') > 75) {
        // Split at 75 bytes, but be careful not to split a multi-byte character
        let chunk = remaining;
        while (Buffer.byteLength(chunk, 'utf8') > 75) {
            chunk = chunk.substring(0, chunk.length - 1);
        }
        result += chunk + '\r\n ';
        remaining = remaining.substring(chunk.length);
    }
    result += remaining;
    return result;
}

// Generate UTC timestamp for DTSTAMP
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
    ].map(foldLine).join('\r\n') + '\r\n';

    events.forEach(event => {
        const description = escapeICSText(event.eventDescription || '');
        const category = eventTypes[event.type] || 'Event';

        // Multi-day events are always all-day regardless of time fields
        const isMultiDay = !!event.endDate;
        const hasTime = event.startTime && event.endTime && !isMultiDay;

        let dtstart, dtend;

        if (hasTime) {
            // Timed single-day event
            dtstart = `DTSTART;TZID=America/New_York:${formatICSDateTime(event.startDate, event.startTime)}`;
            dtend = `DTEND;TZID=America/New_York:${formatICSDateTime(event.startDate, event.endTime)}`;
        } else {
            // All-day event (multi-day or no time specified)
            // Build end date as local Date object to avoid UTC shift, then add 1 day (ICS spec)
            const endDateStr = event.endDate || event.startDate;
            const [ey, em, ed] = endDateStr.split('-').map(Number);
            const endDateObj = new Date(ey, em - 1, ed + 1);

            dtstart = `DTSTART;VALUE=DATE:${formatICSDate(event.startDate)}`;
            dtend = `DTEND;VALUE=DATE:${formatICSDateObj(endDateObj)}`;
        }

        icsContent += [
            'BEGIN:VEVENT',
            `UID:event-${event.id}@atlantahamradio.org`,
            `DTSTAMP:${timestamp}`,
            `SEQUENCE:0`,
            dtstart,
            dtend,
            `SUMMARY:${escapeICSText(event.title)}`,
            `LOCATION:${escapeICSText(event.eventLocation)}`,
            description ? `DESCRIPTION:${description}` : '',
            (event.volunteerSignUpUrl || event.eventUrl) ? `URL:${event.volunteerSignUpUrl || event.eventUrl}` : '',
            `CATEGORIES:${category}`,
            'STATUS:CONFIRMED',
            'TRANSP:TRANSPARENT',
            'END:VEVENT'
        ].filter(line => line).map(foldLine).join('\r\n') + '\r\n';
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
