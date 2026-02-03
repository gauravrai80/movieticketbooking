import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// Load directly from env or fallback to hardcoded if env fails loads (for testing)
const headers = {
    client: process.env.MOVIEGLU_SANDBOX_CLIENT || 'MOVI_286',
    'x-api-key': process.env.MOVIEGLU_SANDBOX_API_KEY || 'jq8AP96P5T3MbZcD7nGIx4vquVIxxhF4aVGVVS31',
    authorization: process.env.MOVIEGLU_SANDBOX_AUTH || 'Basic TU9WSV8yODZfWFg6UGdycTZFbFFiZ3Nu',
    territory: process.env.MOVIEGLU_SANDBOX_TERRITORY || 'XX',
    'api-version': 'v200',
    geolocation: process.env.MOVIEGLU_SANDBOX_GEOLOCATION || '-22.0;14.0',
    'device-datetime': new Date().toISOString()
};

const BASE_URL = 'https://api-gate2.movieglu.com';
const FILM_ID = '184126'; // The Martian (Sandbox default)

async function testFilmShowtimes() {
    console.log('Testing Film Showtimes...');
    console.log(`Film ID: ${FILM_ID}`);
    console.log(`Headers:`, JSON.stringify(headers, null, 2));

    try {
        const date = new Date().toISOString().split('T')[0];
        console.log(`Date: ${date}`);

        const url = `${BASE_URL}/filmShowTimes/`;
        console.log(`Requesting: ${url}`);

        const response = await axios.get(url, {
            headers,
            params: { film_id: FILM_ID, date, n: 5 }
        });

        console.log('Success!');
        console.log('Cinemas found:', response.data.cinemas ? response.data.cinemas.length : 0);

        if (response.data.cinemas && response.data.cinemas.length > 0) {
            console.log('First Cinema:', JSON.stringify(response.data.cinemas[0], null, 2));
        } else {
            console.log('Response body:', JSON.stringify(response.data, null, 2));
        }

    } catch (error) {
        console.error('Error fetching showtimes:');
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
            console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

testFilmShowtimes();
