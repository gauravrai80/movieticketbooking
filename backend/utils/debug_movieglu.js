import axios from 'axios';
import fs from 'fs';

const headers = {
    client: 'MOVI_286',
    'x-api-key': 'jq8AP96P5T3MbZcD7nGIx4vquVIxxhF4aVGVVS31',
    authorization: 'Basic TU9WSV8yODZfWFg6UGdycTZFbFFiZ3Nu',
    territory: 'XX',
    'api-version': 'v200',
    geolocation: '-22.0;14.0',
    'device-datetime': new Date().toISOString()
};

const BASE_URL = 'https://api-gate2.movieglu.com';

async function testMovieGlu() {
    const log = [];
    const logMsg = (msg) => {
        console.log(msg);
        log.push(msg);
    };

    try {
        logMsg('Testing Cinemas Nearby...');
        const cinemasRes = await axios.get(`${BASE_URL}/cinemasNearby/`, {
            headers,
            params: { n: 1 }
        });
        logMsg(`Cinemas Found: ${cinemasRes.data.cinemas?.length}`);
        fs.writeFileSync('debug_output.txt', JSON.stringify(cinemasRes.data, null, 2) + '\n\n');

        if (cinemasRes.data.cinemas && cinemasRes.data.cinemas.length > 0) {
            const cinemaId = cinemasRes.data.cinemas[0].cinema_id;
            logMsg(`Testing Cinema Showtimes for Cinema ID: ${cinemaId}...`);

            const date = new Date().toISOString().split('T')[0];
            const showtimesRes = await axios.get(`${BASE_URL}/cinemaShowTimes/`, {
                headers,
                params: { cinema_id: cinemaId, date }
            });

            fs.appendFileSync('debug_output.txt', 'CINEMA SHOWTIMES:\n' + JSON.stringify(showtimesRes.data, null, 2));

            if (showtimesRes.data.films && showtimesRes.data.films.length > 0) {
                logMsg(`Found ${showtimesRes.data.films.length} films.`);
                logMsg(`First Film ID: ${showtimesRes.data.films[0].film_id}`);
            } else {
                logMsg('No films found for this cinema.');
            }
        }
    } catch (error) {
        logMsg(`Error: ${error.message}`);
        if (error.response) {
            fs.appendFileSync('debug_output.txt', '\nERROR RESPONSE:\n' + JSON.stringify(error.response.data, null, 2));
        }
    }
}

testMovieGlu();
