let events = [];
let currentDate = new Date();
let currentView = 'month';
let filterCategory = 'all';
let searchQuery = '';

const eventTypes = {
    'public-service': { color: '#3b82f6', label: 'Public Service' },
    'activity':       { color: '#a855f7', label: 'Ham Activity' },
    'meeting':        { color: '#f97316', label: 'Meeting/Hamfest' },
    'training':       { color: '#22c55e', label: 'Training & Drills' }
};

const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

// HTML escaping function to prevent XSS attacks
function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Derive a human-readable time string from startTime/endTime (HH:MM 24-hour)
function formatTimeDisplay(startTime, endTime) {
    if (!startTime) return null;
    const fmt = t => {
        const [h, m] = t.split(':').map(Number);
        const period = h >= 12 ? 'pm' : 'am';
        const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
        return m === 0 ? `${hour}${period}` : `${hour}:${String(m).padStart(2, '0')}${period}`;
    };
    return endTime ? `${fmt(startTime)}–${fmt(endTime)}` : fmt(startTime);
}

async function loadEvents() {
    try {
        const response = await fetch('data/events.json');
        const data = await response.json();
        events = data.events.map(e => {
            // Parse startDate as local time to avoid timezone offset issues
            const [year, month, day] = e.startDate.split('-').map(Number);
            const eventData = {
                ...e,
                startDate: new Date(year, month - 1, day)
            };

            // Parse endDate if it exists
            if (e.endDate) {
                const [endYear, endMonth, endDay] = e.endDate.split('-').map(Number);
                eventData.endDate = new Date(endYear, endMonth - 1, endDay);
            }

            return eventData;
        });
        renderCalendar();
    } catch (error) {
        console.error('Error loading events:', error);
        events = [];
        renderCalendar();
    }
}

function renderFilters() {
    const filtersContainer = document.getElementById('filters');
    filtersContainer.innerHTML = `
        <span class="filter-label">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Filter:
        </span>
        <button class="filter-btn ${filterCategory === 'all' ? 'active' : ''}" onclick="setFilter('all')">
            All Events
        </button>
        ${Object.entries(eventTypes).map(([key, type]) => `
            <button class="filter-btn ${filterCategory === key ? 'active' : ''}" onclick="setFilter('${key}')">
                <span class="event-dot" style="background: ${type.color}"></span>
                ${type.label}
            </button>
        `).join('')}
    `;
}

function setFilter(category) {
    filterCategory = category;
    renderCalendar();
}

function handleSearch() {
    searchQuery = document.getElementById('searchInput').value.toLowerCase();

    const clearBtn = document.getElementById('searchClearBtn');
    if (clearBtn) {
        clearBtn.style.display = searchQuery ? 'flex' : 'none';
    }

    if (searchQuery && currentView === 'month') {
        setView('list');
    }

    renderCalendar();
}

function clearSearch() {
    searchQuery = '';
    document.getElementById('searchInput').value = '';

    const clearBtn = document.getElementById('searchClearBtn');
    if (clearBtn) {
        clearBtn.style.display = 'none';
    }

    renderCalendar();
}

function setView(view) {
    currentView = view;
    document.getElementById('monthViewBtn').classList.toggle('active', view === 'month');
    document.getElementById('listViewBtn').classList.toggle('active', view === 'list');

    const monthNav = document.querySelector('.month-nav');
    if (monthNav) {
        monthNav.style.visibility = view === 'month' ? 'visible' : 'hidden';
    }

    if (view === 'month' && searchQuery) {
        searchQuery = '';
        document.getElementById('searchInput').value = '';
    }

    renderCalendar();
}

function changeMonth(direction) {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1);
    renderCalendar();
}

function getEventsForDay(day) {
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

    return events.filter(event => {
        if (filterCategory !== 'all' && event.type !== filterCategory) return false;

        const startDate = new Date(event.startDate);
        startDate.setHours(0, 0, 0, 0);

        const endDate = event.endDate ? new Date(event.endDate) : new Date(event.startDate);
        endDate.setHours(23, 59, 59, 999);

        checkDate.setHours(12, 0, 0, 0);

        return checkDate >= startDate && checkDate <= endDate;
    });
}

function renderCalendar() {
    document.getElementById('monthYear').textContent =
        `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

    renderFilters();

    const container = document.getElementById('calendarContainer');

    if (currentView === 'month') {
        container.innerHTML = renderMonthView();
    } else {
        container.innerHTML = renderListView();
    }
}

function renderMonthView() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

    let html = '<div class="calendar-grid">';

    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
        html += `<div class="day-header">${day}</div>`;
    });

    for (let i = 0; i < firstDay; i++) {
        html += '<div></div>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayEvents = getEventsForDay(day);
        const isToday = isCurrentMonth && today.getDate() === day;

        html += `
            <div class="calendar-day ${isToday ? 'today' : ''}">
                <div class="date">${day}</div>
                <div class="events">
                    ${dayEvents.slice(0, 2).map(event => `
                        <div class="mini-event event-type-${event.type}" onclick='showEventModal(${event.id})'>
                            ${escapeHTML(event.title)}
                        </div>
                    `).join('')}
                    ${dayEvents.length > 2 ? `<div class="more-events">+${dayEvents.length - 2} more</div>` : ''}
                </div>
            </div>
        `;
    }

    html += '</div>';
    return html;
}

function renderListView() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filteredEvents = events
        .filter(e => {
            if (filterCategory !== 'all' && e.type !== filterCategory) return false;
            if (searchQuery && !e.title.toLowerCase().includes(searchQuery)) return false;
            const eventEndDate = e.endDate || e.startDate;
            if (eventEndDate < today) return false;
            return true;
        })
        .sort((a, b) => a.startDate - b.startDate);

    if (filteredEvents.length === 0) {
        const message = searchQuery
            ? `No events found matching "${document.getElementById('searchInput').value}".`
            : 'No events found for the selected filter.';
        return `<div style="text-align: center; padding: 2rem; color: #94a3b8;">${message}</div>`;
    }

    return `
        <div class="list-view">
            ${filteredEvents.map(event => {
                const timeDisplay = formatTimeDisplay(event.startTime, event.endTime);
                return `
                <div class="event-card" onclick='showEventModal(${event.id})'>
                    <div class="event-card-header">
                        <div class="event-card-info">
                            <div class="event-type-badge">
                                <span class="event-dot" style="background: ${eventTypes[event.type].color}"></span>
                                <span>${eventTypes[event.type].label}</span>
                            </div>
                            <h4>${escapeHTML(event.title)}</h4>
                            <div class="event-details">
                                <div class="event-detail">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                    ${event.endDate && event.endDate.getTime() !== event.startDate.getTime()
                                        ? `${event.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${event.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                                        : event.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                    }
                                </div>
                                ${timeDisplay ? `
                                <div class="event-detail">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    ${timeDisplay}
                                </div>
                                ` : ''}
                                <div class="event-detail">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                                    ${escapeHTML(event.eventLocation)}
                                </div>
                            </div>
                        </div>
                        <button class="btn btn-primary">Details</button>
                    </div>
                </div>
            `}).join('')}
        </div>
    `;
}

function showEventModal(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const modal = document.getElementById('eventModal');
    const typeBadge = document.getElementById('modalTypeBadge');
    const title = document.getElementById('modalTitle');
    const details = document.getElementById('modalDetails');
    const description = document.getElementById('modalDescription');
    const contactInfo = document.getElementById('modalContactInfo');

    // Type badge
    typeBadge.innerHTML = `
        <span class="event-dot" style="background: ${eventTypes[event.type].color}"></span>
        <span>${eventTypes[event.type].label}</span>
    `;

    // Title
    title.textContent = event.title;

    // Date / time / location block
    const timeDisplay = formatTimeDisplay(event.startTime, event.endTime);
    details.innerHTML = `
        <div class="modal-detail">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            ${event.endDate && event.endDate.getTime() !== event.startDate.getTime()
                ? `${event.startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} – ${event.endDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`
                : event.startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
            }
        </div>
        ${timeDisplay ? `
        <div class="modal-detail">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${timeDisplay}
        </div>
        ` : ''}
        <div class="modal-detail">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            ${escapeHTML(event.eventLocation)}
        </div>
    `;

    // Description
    if (event.eventDescription) {
        description.textContent = event.eventDescription;
        description.style.display = '';
    } else {
        description.textContent = '';
        description.style.display = 'none';
    }

    // Contact / action block — type-specific
    let contactHTML = '';

    // Event organizer row (all types)
    if (event.eventOrganizer || event.eventUrl) {
        if (event.eventOrganizer && event.eventUrl) {
            contactHTML += `<p style="margin-bottom:0.5rem;"><strong>Event Info:</strong> <a href="${escapeHTML(event.eventUrl)}" target="_blank" rel="noopener noreferrer" style="color:#3b82f6;text-decoration:none;">${escapeHTML(event.eventOrganizer)}</a></p>`;
        } else if (event.eventOrganizer) {
            contactHTML += `<p style="margin-bottom:0.5rem;"><strong>Organized by:</strong> ${escapeHTML(event.eventOrganizer)}</p>`;
        } else {
            contactHTML += `<p style="margin-bottom:0.5rem;"><strong>Event Info:</strong> <a href="${escapeHTML(event.eventUrl)}" target="_blank" rel="noopener noreferrer" style="color:#3b82f6;text-decoration:none;">${escapeHTML(event.eventUrl)}</a></p>`;
        }
    }

    // Public service: volunteer section
    if (event.type === 'public-service') {
        contactHTML += `<p style="margin-top:1rem;margin-bottom:0.5rem;font-weight:600;border-top:1px solid #334155;padding-top:0.75rem;">Ham Radio Volunteers Needed</p>`;

        if (event.hamCoordinator) {
            const coordText = escapeHTML(event.hamCoordinator);
            const coordLink = event.hamCoordinatorUrl
                ? `<a href="${escapeHTML(event.hamCoordinatorUrl)}" target="_blank" rel="noopener noreferrer" style="color:#3b82f6;text-decoration:none;">${coordText}</a>`
                : `<strong>${coordText}</strong>`;

            if (event.volunteerSignUpUrl) {
                contactHTML += `<p style="margin-bottom:0.5rem;"><strong>Ham Radio Contact:</strong> ${coordLink}</p>`;
            } else {
                contactHTML += `<p style="margin-bottom:0.5rem;">To volunteer as a ham radio operator, contact ${coordLink}.</p>`;
            }
        } else if (event.hamCoordinatorUrl && !event.volunteerSignUpUrl) {
            contactHTML += `<p style="margin-bottom:0.5rem;"><a href="${escapeHTML(event.hamCoordinatorUrl)}" target="_blank" rel="noopener noreferrer" style="color:#3b82f6;text-decoration:none;">Contact the ham radio coordinator to volunteer</a></p>`;
        }

        if (event.volunteerSignUpUrl) {
            contactHTML += `<p style="margin-bottom:0.5rem;"><a href="${escapeHTML(event.volunteerSignUpUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="display:inline-block;text-decoration:none;">Sign Up to Volunteer</a></p>`;
        }

        if (event.notes) {
            contactHTML += `<p style="margin-top:0.75rem;margin-bottom:0.5rem;white-space:pre-line;"><strong>Sign-up Instructions:</strong><br>${escapeHTML(event.notes)}</p>`;
        }

    } else if (event.notes) {
        // Activity / meeting / training: show notes with a neutral label
        const notesLabel = event.type === 'training' ? 'Participation Notes' : 'Notes';
        contactHTML += `<p style="margin-top:${contactHTML ? '1rem' : '0'};margin-bottom:0.5rem;white-space:pre-line;"><strong>${notesLabel}:</strong><br>${escapeHTML(event.notes)}</p>`;
    }

    contactInfo.innerHTML = contactHTML;

    // Add to Calendar button
    const addToCalendarBtn = document.getElementById('addToCalendarBtn');
    addToCalendarBtn.onclick = (e) => {
        e.stopPropagation();
        downloadICS(event);
    };

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(event) {
    if (!event || event.target.id === 'eventModal') {
        document.getElementById('eventModal').classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Subscribe modal functions
function openSubscribeModal() {
    const modal = document.getElementById('subscribeModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSubscribeModal(event) {
    if (!event || event.target.id === 'subscribeModal') {
        document.getElementById('subscribeModal').classList.remove('active');
        document.body.style.overflow = '';
    }
}

async function copySubscribeUrl() {
    const calendarUrl = 'https://atlantahamradio.org/events.ics';
    const input = document.getElementById('calendarUrlInput');
    const button = document.getElementById('copyUrlBtn');

    try {
        await navigator.clipboard.writeText(calendarUrl);
        button.innerHTML = '✓ Copied!';
        button.style.background = '#22c55e';
        input.select();
        setTimeout(() => {
            button.innerHTML = 'Copy';
            button.style.background = '#3b82f6';
        }, 2000);
    } catch (err) {
        console.error('Failed to copy URL:', err);
        input.select();
        button.innerHTML = 'Select & Copy';
        setTimeout(() => {
            button.innerHTML = 'Copy';
        }, 2000);
    }
}

// ICS file generation utilities
function formatICSDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

function formatICSDateTime(date, timeString) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const [hours, minutes] = timeString.split(':');
    return `${year}${month}${day}T${hours}${minutes}00`;
}

function escapeICSText(text) {
    if (!text) return '';
    return text.replace(/\\/g, '\\\\')
                  .replace(/;/g, '\\;')
                  .replace(/,/g, '\\,')
                  .replace(/\n/g, '\\n');
}

function generateICS(event) {
    const now = new Date();
    const timestamp = formatICSDate(now) + 'T' +
        now.getHours().toString().padStart(2, '0') +
        now.getMinutes().toString().padStart(2, '0') +
        now.getSeconds().toString().padStart(2, '0') + 'Z';

    const description = escapeICSText(event.eventDescription || '');
    const isMultiDay = !!event.endDate;
    const hasTime = event.startTime && event.endTime && !isMultiDay;

    let dtstart, dtend;
    let timezoneBlock = '';

    if (hasTime) {
        dtstart = `DTSTART;TZID=America/New_York:${formatICSDateTime(event.startDate, event.startTime)}`;
        dtend = `DTEND;TZID=America/New_York:${formatICSDateTime(event.startDate, event.endTime)}`;
        timezoneBlock = [
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
        ].join('\r\n');
    } else {
        const startDateStr = formatICSDate(event.startDate);
        const endDateObj = event.endDate ? new Date(event.endDate) : new Date(event.startDate);
        endDateObj.setDate(endDateObj.getDate() + 1);
        const endDate = formatICSDate(endDateObj);
        dtstart = `DTSTART;VALUE=DATE:${startDateStr}`;
        dtend = `DTEND;VALUE=DATE:${endDate}`;
    }

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Atlanta Ham Radio//Events//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        timezoneBlock,
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
        `CATEGORIES:${eventTypes[event.type]?.label || 'Event'}`,
        'STATUS:CONFIRMED',
        'TRANSP:TRANSPARENT',
        'END:VEVENT',
        'END:VCALENDAR'
    ].filter(line => line).join('\r\n');

    return icsContent;
}

function downloadICS(event) {
    const icsContent = generateICS(event);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    loadEvents();
});
