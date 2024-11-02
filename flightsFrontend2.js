// Update API URLs
const API_URL = 'http://127.0.0.1:3001'; // Replace with your EC2 instance's IP address or domain

// Populate city dropdowns when the document is loaded
document.addEventListener('DOMContentLoaded', async () => {
    await populateCityDropdowns();
});

async function populateCityDropdowns() {
    try {
        const response = await fetch(`${API_URL}/api/cities`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const cities = await response.json();

        const departureCityOptions = document.getElementById('departure-city-options');
        const arrivalCityOptions = document.getElementById('arrival-city-options');

        departureCityOptions.innerHTML = ''; // Clear previous options
        arrivalCityOptions.innerHTML = '';   // Clear previous options

        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            departureCityOptions.appendChild(option.cloneNode(true));
            arrivalCityOptions.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching cities:', error);
    }
}

async function fetchFlightData(departureDate, departureCity, arrivalCity) {
    try {
        const response = await fetch(`${API_URL}/api/flights`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ departureDate, departureCity, arrivalCity }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const flights = await response.json();
        displayFlightResults(flights);
    } catch (error) {
        console.error('Error fetching flights:', error);
    }
}

function formatDateTimeTo12Hour(dateTime) {
    const date = new Date(dateTime);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour = (hours % 12) || 12;
    return `${date.toLocaleDateString()} ${hour}:${minutes} ${ampm}`;
}

function formatDuration(duration) {
    const [hours, minutes, seconds] = duration.split(':').map(Number);
    return `${hours} hours, ${minutes} minutes`;
}

function displayFlightResults(flights) {
    const flightResultsBody = document.getElementById('flight-results-body');
    flightResultsBody.innerHTML = ''; // Clear previous results

    if (flights.length === 0) {
        flightResultsBody.innerHTML = '<tr><td colspan="12">No flights found for the selected criteria.</td></tr>';
        return;
    }

    flights.forEach(flight => {
        const row = document.createElement('tr');

        const flightIdCell = document.createElement('td');
        flightIdCell.textContent = flight.flight_id;
        row.appendChild(flightIdCell);

        const airlineCell = document.createElement('td');
        airlineCell.textContent = flight.airline;
        row.appendChild(airlineCell);

        const departureAirportCell = document.createElement('td');
        departureAirportCell.textContent = flight.departure_airport;
        row.appendChild(departureAirportCell);

        const arrivalAirportCell = document.createElement('td');
        arrivalAirportCell.textContent = flight.arrival_airport;
        row.appendChild(arrivalAirportCell);

        const layoverAirportCell = document.createElement('td');
        layoverAirportCell.textContent = flight.layover_airport ? flight.layover_airport : 'None';
        row.appendChild(layoverAirportCell);

        const layoverDurationCell = document.createElement('td');
        layoverDurationCell.textContent = flight.layover_duration ? formatDuration(flight.layover_duration) : 'N/A';
        row.appendChild(layoverDurationCell);

        const secondFlightDepartureTimeCell = document.createElement('td');
        secondFlightDepartureTimeCell.textContent = flight.second_flight_departure_datetime ? formatDateTimeTo12Hour(flight.second_flight_departure_datetime) : 'N/A';
        row.appendChild(secondFlightDepartureTimeCell);

        const totalFlightDurationCell = document.createElement('td');
        totalFlightDurationCell.textContent = flight.total_flight_duration ? formatDuration(flight.total_flight_duration) : 'N/A';
        row.appendChild(totalFlightDurationCell);

        const departureTimeCell = document.createElement('td');
        departureTimeCell.textContent = formatDateTimeTo12Hour(flight.departure_datetime);
        row.appendChild(departureTimeCell);

        const arrivalTimeCell = document.createElement('td');
        arrivalTimeCell.textContent = formatDateTimeTo12Hour(flight.arrival_datetime);
        row.appendChild(arrivalTimeCell);

        const costCell = document.createElement('td');
        costCell.textContent = `$${flight.cost}`;
        row.appendChild(costCell);

        flightResultsBody.appendChild(row);
    });
}

// Event listener for flight search button
document.getElementById('search-flights-button').addEventListener('click', () => {
    const departureDate = document.getElementById('departure-date').value;
    const departureCity = document.getElementById('departure-city').value;
    const arrivalCity = document.getElementById('arrival-city').value;

    if (departureDate && departureCity && arrivalCity) {
        fetchFlightData(departureDate, departureCity, arrivalCity);
    } else {
        alert('Please fill in all fields before searching for flights.');
    }
});
