// Data
let busData = [];
let stopsById = new Map();

// DOM Elements
const fromLocationSelect = document.getElementById('fromLocation');
const toLocationSelect = document.getElementById('toLocation');
const searchBtn = document.getElementById('searchBtn');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const resultsContainer = document.getElementById('resultsContainer');
const busResults = document.getElementById('busResults');
const noResultsMsg = document.getElementById('noResultsMsg');
const emptyState = document.getElementById('emptyState');
const resultsTitle = document.getElementById('resultsTitle');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadBusData();
    trackVisitCount();
});

async function trackVisitCount() {
    const visitorCount = document.getElementById('visitorCount');

    try {
        const counter = new Counter({ workspace: 'vandivanno-bus-timing' });
        const result = await counter.up('visits');
        if (typeof result.value !== 'number') {
            throw new Error('Counter response did not include a numeric value.');
        }

        visitorCount.textContent = `Visits: ${result.value.toLocaleString()}`;
    } catch (error) {
        console.error('Error loading visitor count:', error);
        visitorCount.textContent = 'Visits: unavailable';
    }
}

// Load bus data from JSON file
async function loadBusData() {
    try {
        const response = await fetch('data/buses.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        busData = await response.json();
        stopsById = new Map((busData.stops || []).map(stop => [stop.id, stop]));
        populateFromLocations();
    } catch (error) {
        console.error('Error loading bus data:', error);
        alert('Failed to load bus data. Please refresh the page.');
    }
}

// Populate "From" dropdown with unique locations that have a valid next stop in at least one route
function populateFromLocations() {
    const validFromStopIds = new Set();

    (busData.routes || []).forEach(route => {
        const stopIds = (route.stops || []).map(stop => getSharedStopId(stop)).filter(Boolean);

        for (let i = 0; i < stopIds.length - 1; i++) {
            validFromStopIds.add(stopIds[i]);
        }
    });

    const sortedStops = (busData.stops || [])
        .filter(stop => validFromStopIds.has(stop.id))
        .sort((a, b) => a.name.localeCompare(b.name));

    sortedStops.forEach(stop => {
        const option = document.createElement('option');
        option.value = String(stop.id);
        option.textContent = stop.name;
        fromLocationSelect.appendChild(option);
    });
}

// Handle "From" location selection
fromLocationSelect.addEventListener('change', (e) => {
    const selectedFromStopId = Number(e.target.value);
    
    // Clear "To" dropdown
    toLocationSelect.innerHTML = '<option value="">-- Select destination stop --</option>';
    toLocationSelect.disabled = !selectedFromStopId;
    
    if (!selectedFromStopId) {
        updateSearchButtonState();
        return;
    }

    populateToLocations(selectedFromStopId);
    updateSearchButtonState();
});

function populateToLocations(fromStopId) {
    const toStopIds = new Set();

    busData.routes.forEach(route => {
        const fromIndex = getRouteStopIndex(route, fromStopId);
        if (fromIndex === -1) {
            return;
        }

        route.stops.slice(fromIndex + 1).forEach(stop => {
            const stopId = getSharedStopId(stop);
            if (stopId) {
                toStopIds.add(stopId);
            }
        });
    });

    const sortedStops = Array.from(toStopIds)
        .map(stopId => stopsById.get(stopId))
        .filter(Boolean)
        .sort((a, b) => a.name.localeCompare(b.name));

    sortedStops.forEach(stop => {
        const option = document.createElement('option');
        option.value = String(stop.id);
        option.textContent = stop.name;
        toLocationSelect.appendChild(option);
    });
}

// Handle "To" location selection
toLocationSelect.addEventListener('change', () => {
    updateSearchButtonState();
});

// Update search button state
function updateSearchButtonState() {
    const fromSelected = fromLocationSelect.value;
    const toSelected = toLocationSelect.value;
    searchBtn.disabled = !fromSelected || !toSelected;
}

// Handle search button click
searchBtn.addEventListener('click', performSearch);

// Perform search
function performSearch() {
    const fromStopId = Number(fromLocationSelect.value);
    const toStopId = Number(toLocationSelect.value);
    const fromStopName = stopsById.get(fromStopId)?.name || '';
    const toStopName = stopsById.get(toStopId)?.name || '';

    if (!fromStopId || !toStopId) {
        alert('Please select both departure and destination stops.');
        return;
    }

    if (fromStopId === toStopId) {
        alert('Please select different departure and destination stops.');
        return;
    }

    // Find matching routes that include both stops in travel order
    const matchingRoutes = busData.routes.filter(route => {
        const fromIndex = getRouteStopIndex(route, fromStopId);
        const toIndex = getRouteStopIndex(route, toStopId);
        return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
    });

    // Clear previous results
    busResults.innerHTML = '';
    emptyState.classList.add('hidden');

    if (matchingRoutes.length === 0) {
        resultsContainer.classList.remove('hidden');
        noResultsMsg.classList.remove('hidden');
        resultsTitle.textContent = `Buses from ${fromStopName} to ${toStopName}`;
        return;
    }

    // Display results
    noResultsMsg.classList.add('hidden');
    resultsContainer.classList.remove('hidden');
    resultsTitle.textContent = `Buses from ${fromStopName} to ${toStopName}`;

    matchingRoutes.forEach(route => {
        const busCard = createBusCard(route, fromStopId, toStopId);
        busResults.appendChild(busCard);
    });
}

// Create a bus card for display
function createBusCard(route, fromStopId, toStopId) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600 hover:shadow-lg transition-shadow';

    const originStop = route.stops.find(stop => getSharedStopId(stop) === fromStopId);
    const destinationStop = route.stops.find(stop => getSharedStopId(stop) === toStopId);
    const startTime = originStop?.departureTime || originStop?.arrivalTime || route.startTime;
    const endTime = destinationStop?.arrivalTime || route.endTime;
    const duration = calculateDuration(startTime, endTime);

    const routeStartStop = route.stops[0] || { stopID: route.fromStopId };
    const routeEndStop = route.stops[route.stops.length - 1] || { stopID: route.toStopId };
    const routeStartName = getStopName(routeStartStop);
    const routeEndName = getStopName(routeEndStop);

    card.innerHTML = `
        <div class="flex justify-between items-start mb-4">
            <div>
                <h3 class="text-xl font-bold text-gray-800">${escapeHtml(route.busName)}</h3>
                <p class="text-sm text-gray-500 mt-1">
                    <span class="bg-gray-200 px-3 py-1 rounded text-xs mr-2">${escapeHtml(route.busType)}</span>
                    <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded text-xs">${escapeHtml(route.speciality)}</span>
                </p>
            </div>
            <div class="text-right min-w-0 max-w-[45%]">
                <p class="text-sm font-semibold text-gray-700 truncate">${escapeHtml(routeStartName)} → ${escapeHtml(routeEndName)}</p>
                <p class="text-xs text-gray-500 mt-1">Route</p>
            </div>
        </div>

        <div class="flex justify-between items-center mb-4 text-center">
            <div class="flex-1 text-center">
                <p class="text-2xl font-bold text-gray-800">${startTime}</p>
                <p class="text-xs text-gray-500 truncate">${escapeHtml(stopsById.get(fromStopId)?.name || 'From')}</p>
            </div>
            <div class="text-gray-400 flex-1 px-4">
                <p class="text-lg">→</p>
                <p class="text-xs text-gray-500">${duration}</p>
            </div>
            <div class="flex-1 text-center">
                <p class="text-2xl font-bold text-gray-800">${endTime}</p>
                <p class="text-xs text-gray-500 truncate">${escapeHtml(stopsById.get(toStopId)?.name || 'To')}</p>
            </div>
        </div>

        <div class="border-t pt-4">
            <button type="button" class="toggle-stops w-full flex items-center justify-between text-left text-sm font-semibold text-gray-700 mb-2 focus:outline-none" data-expanded="false">
                <span>Stops (${route.stops.length}):</span>
                <span class="text-xs text-blue-600">Expand</span>
            </button>
            <div class="stops-list hidden space-y-2 max-h-48 overflow-y-auto">
                ${route.stops.map((stop, index) => `
                    <div class="stop-item text-sm">
                        <p class="font-medium text-gray-800">${index + 1}. ${escapeHtml(getStopName(stop))}</p>
                        <p class="text-xs text-gray-500">
                            Arr: ${stop.arrivalTime} ${stop.departureTime ? `| Dep: ${stop.departureTime}` : '(Final)' }
                        </p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    const toggleButton = card.querySelector('.toggle-stops');
    const stopsList = card.querySelector('.stops-list');

    toggleButton.addEventListener('click', () => {
        const expanded = toggleButton.dataset.expanded === 'true';
        toggleButton.dataset.expanded = String(!expanded);
        stopsList.classList.toggle('hidden', expanded);
        toggleButton.querySelector('span:last-child').textContent = expanded ? 'Expand' : 'Collapse';
    });

    return card;
}

// Clear search and reset UI
clearSearchBtn.addEventListener('click', () => {
    fromLocationSelect.value = '';
    toLocationSelect.value = '';
    toLocationSelect.disabled = true;
    resultsContainer.classList.add('hidden');
    emptyState.classList.remove('hidden');
    updateSearchButtonState();
});

// Parse times like 07:15AM or 09:45PM into total minutes from midnight
function parseTimeToMinutes(timeValue) {
    if (!timeValue) {
        return NaN;
    }

    const trimmed = String(timeValue).trim();
    const meridiemMatch = trimmed.match(/^(\d{1,2}):(\d{2})(AM|PM)$/i);
    if (meridiemMatch) {
        let hour = Number(meridiemMatch[1]);
        const minute = Number(meridiemMatch[2]);
        const period = meridiemMatch[3].toUpperCase();

        if (period === 'AM' && hour === 12) {
            hour = 0;
        }
        if (period === 'PM' && hour !== 12) {
            hour += 12;
        }

        return hour * 60 + minute;
    }

    const plainMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);
    if (!plainMatch) {
        return NaN;
    }

    const hour = Number(plainMatch[1]);
    const minute = Number(plainMatch[2]);
    return hour * 60 + minute;
}

// Helper: Calculate duration between two times (supports AM/PM format)
function calculateDuration(startTime, endTime) {
    const startMinutes = parseTimeToMinutes(startTime);
    const endMinutes = parseTimeToMinutes(endTime);

    if (Number.isNaN(startMinutes) || Number.isNaN(endMinutes)) {
        return 'N/A';
    }

    let adjustedEndMinutes = endMinutes;

    // Handle overnight routes
    if (adjustedEndMinutes < startMinutes) {
        adjustedEndMinutes += 24 * 60;
    }

    const durationMinutes = adjustedEndMinutes - startMinutes;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (hours === 0) {
        return `${minutes}m`;
    } else if (minutes === 0) {
        return `${hours}h`;
    } else {
        return `${hours}h ${minutes}m`;
    }
}

// Helper: Calculate fare (can be enhanced with distance-based pricing)
function calculateFare(route) {
    // Simple fare calculation: base 100 + 50 per stop
    // Can be enhanced with actual fare data in JSON
    return Math.max(100, (route.stops.length - 1) * 50);
}

function getSharedStopId(stop) {
    return stop?.stopID ?? stop?.stopId;
}

function getRouteStopIndex(route, stopId) {
    return route.stops.findIndex(stop => getSharedStopId(stop) === stopId);
}

// Helper: Resolve stop name from normalized stop catalog
function getStopName(stop) {
    if (stop && stop.name) {
        return stop.name;
    }

    const sharedStopId = getSharedStopId(stop);
    const normalizedStop = stopsById.get(sharedStopId);
    return normalizedStop ? normalizedStop.name : `Stop ${sharedStopId || ''}`.trim();
}

// Helper: Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text ?? '').replace(/[&<>"']/g, m => map[m]);
}
