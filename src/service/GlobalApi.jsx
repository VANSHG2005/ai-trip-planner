import axios from "axios";

const UNSPLASH_BASE_URL = 'https://api.unsplash.com/search/photos';
const UNSPLASH_API_KEY = import.meta.env.VITE_UNSPLASH_API_KEY;

/**
 * Fetches a photo from Unsplash based on a text query.
 * @param {string} query - The location or place to search for.
 * @returns {Promise} - An axios promise for the API request.
 */
export const getUnsplashPhoto = (query) => {
    return axios.get(UNSPLASH_BASE_URL, {
        params: {
            query: query,
            per_page: 1, 
            orientation: 'landscape',
            client_id: UNSPLASH_API_KEY
        }
    });
};