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
        'X-PUBLISHED-TTL:PT12H'
    ].join('\r\n') + '\r\n';

    events.forEach(event => {
        const startDate = formatICSDate(event.date);

        // For all-day events, end date should be the day AFTER the last day
        const endDateObj = event.endDate ? new Date(event.endDate) : new Date(event.date);
        endDateObj.setDate(endDateObj.getDate() + 1);
        const endDate = formatICSDate(endDateObj);

        const description = escapeICSText(event.description || '');
        const category = eventTypes[event.type] || 'Event';

        icsContent += [
            'BEGIN:VEVENT',
            `UID:event-${event.id}@atlantahamradio.org`,
            `DTSTAMP:${timestamp}`,
            `DTSTART;VALUE=DATE:${startDate}`,
            `DTEND;VALUE=DATE:${endDate}`,
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
