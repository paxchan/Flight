require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const { check, validationResult } = require('express-validator');
const app = express();

app.use(cors());
app.use(express.json());

// MySQL connection setup using environment variables
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password123',
    database: 'FlightResearch',
    port: 3306
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL successfully');
    }
});

// Endpoint to test database connection
app.get('/api/test-connection', (req, res) => {
    db.ping((err) => {
        if (err) {
            console.error('MySQL Connection Failed:', err);
            res.status(500).send('Database connection failed.');
        } else {
            res.send('Database connection successful.');
        }
    });
});

// Endpoint to get all cities for dropdown
app.get('/api/cities', (req, res) => {
    const query = 'SELECT DISTINCT city FROM Airports';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching cities:', err);
            res.status(500).send('An error occurred while fetching cities from the database.');
        } else {
            const cities = results.map(row => row.city);
            res.json(cities);
        }
    });
});

// Endpoint to get flights based on user query
app.post('/api/flights', [
    check('departureDate').isISO8601(),
    check('departureCity').notEmpty(),
    check('arrivalCity').notEmpty()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { departureDate, departureCity, arrivalCity } = req.body;

    const query = `
        SELECT 
            Flights.flight_id, 
            Airlines.airline_name AS airline,
            Departure.airport_name AS departure_airport,
            Arrival.airport_name AS arrival_airport,
            Layover.airport_name AS layover_airport,
            Flights.layover_duration,
            Flights.second_flight_departure_datetime,
            Flights.total_flight_duration,
            Flights.departure_datetime, 
            Flights.arrival_datetime, 
            Flights.cost 
        FROM 
            Flights
        JOIN 
            Airports AS Departure ON Flights.departure_airport_id = Departure.airport_id
        JOIN 
            Airports AS Arrival ON Flights.arrival_airport_id = Arrival.airport_id
        LEFT JOIN 
            Airports AS Layover ON Flights.layover_airport_id = Layover.airport_id
        JOIN 
            Airlines ON Flights.airline_id = Airlines.airline_id
        WHERE 
            Departure.city = ? 
            AND Arrival.city = ?
            AND DATE(Flights.departure_datetime) = ?
    `;

    db.query(query, [departureCity, arrivalCity, departureDate], (err, results) => {
        if (err) {
            console.error('Error fetching flights:', err);
            res.status(500).send('An error occurred while fetching flights from the database.');
        } else {
            res.json(results);
        }
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.send('Welcome to the Flight Research API');
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
