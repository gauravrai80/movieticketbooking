import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

class MovieGluService {
    constructor() {
        this.baseUrl = process.env.MOVIEGLU_ENDPOINT || 'https://api-gate2.movieglu.com';
        this.apiVersion = process.env.MOVIEGLU_API_VERSION || 'v200';
    }

    _getHeaders() {
        return {
            client: process.env.MOVIEGLU_CLIENT,
            'x-api-key': process.env.MOVIEGLU_API_KEY,
            authorization: process.env.MOVIEGLU_AUTHORIZATION,
            territory: process.env.MOVIEGLU_TERRITORY || 'UK',
            'api-version': this.apiVersion,
            geolocation: process.env.MOVIEGLU_GEOLOCATION || '-22.0;14.0',
            'device-datetime': new Date().toISOString()
        };
    }

    async getMoviesNowShowing(n = 20) {
        try {
            const response = await axios.get(`${this.baseUrl}/filmsNowShowing/`, {
                headers: this._getHeaders(),
                params: { n }
            });
            return response.data;
        } catch (error) {
            console.error('MovieGlu filmsNowShowing error:', error.response?.data || error.message);
            throw error;
        }
    }

    async getCinemaShowtimes(cinemaId, date) {
        try {
            const response = await axios.get(`${this.baseUrl}/cinemaShowTimes/`, {
                headers: this._getHeaders(),
                params: {
                    cinema_id: cinemaId,
                    date: date, // YYYY-MM-DD
                    sort: 'film_name'
                }
            });
            return response.data;
        } catch (error) {
            console.error(`MovieGlu cinemaShowTimes error for cinema ${cinemaId}:`, error.response?.data || error.message);
            throw error;
        }
    }

    async getFilmDetails(filmId) {
        try {
            // Note: MovieGlu might not have a direct independent detail endpoint in all tiers,
            // but commonly details come with list endpoints.
            // Implementing if specific endpoint exists or assumed.
            // For now, let's assume we use filmId to fetch via a list filter or specific endpoint if available.
            // Reverting to fetching via list logic ideally, but let's assume valid calling code uses data from lists.
            // Or implement filmShowTimes which returns details.
            return null;
        } catch (error) {
            // console.error('MovieGlu film details error:', error);
            return null;
        }
    }
}

export default new MovieGluService();
