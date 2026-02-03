import axios from 'axios';
import https from 'https';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('Testing TMDB Connectivity...');
console.log('API Key present:', !!process.env.TMDB_API_KEY);
console.log('Base URL:', process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3');

const client = axios.create({
    baseURL: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3',
    timeout: 10000,
    httpsAgent: new https.Agent({ keepAlive: false }),
    params: {
        api_key: process.env.TMDB_API_KEY,
        language: 'en-US'
    }
});

async function test() {
    try {
        console.log('Sending request to /movie/now_playing...');
        const result = await client.get('/movie/now_playing?page=1');
        console.log('Success! Status:', result.status);
        console.log('Movies found:', result.data.results?.length);
    } catch (error) {
        console.error('Request failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        } else if (error.code) {
            console.error('Error code:', error.code);
        }
    }
}

test();
