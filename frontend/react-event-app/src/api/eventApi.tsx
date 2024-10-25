import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const fetchEventsMap = async (cityName?: string, category?: string, searchTerm?: string) => {
    const params = new URLSearchParams();
    if (cityName) params.append('cityName', cityName);
    if (category) params.append('category', category);
    if (searchTerm) params.append('searchTerm', searchTerm);

    return await fetchFromApi("/events/map", params);
};

export const fetchEventsList = async (page: number, size: number, cityName?: string, category?: string, searchTerm?: string) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (cityName) params.append('cityName', cityName);
    if (category) params.append('category', category);
    if (searchTerm) params.append('searchTerm', searchTerm);

    return await fetchFromApi("/events/list", params);
};

export const fetchEventCount = async () => {
    return await fetchFromApi("/events/count");
};

export const fetchCities = async () => {
    return await fetchFromApi("/cities/all");
};

export const fetchEventById = async (eventId: string) => {
    return await fetchFromApi(`/events/${eventId}`);
};

export const fetchCity = async (cityName?: string) => {
    const params = new URLSearchParams();
    if (cityName) params.append('cityName', cityName);

    return await fetchFromApi("/cities", params);
};

export const fetchCategories = async () => {
    return await fetchFromApi("/categories/all");
};

export const fetchReactionCountByType = async (eventId: string | number,
                                               reactionType: string): Promise<number> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/events/${eventId}/count`, {
            params: { reactionType },
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Error fetching reaction count:", error.message);
            throw new Error(`Failed to fetch reaction count: ${error.message}`);
        } else {
            console.error("Unknown error fetching reaction count:", error);
            throw new Error('An unknown error occurred while fetching reaction count');
        }
    }
};


const fetchFromApi = async (endpoint: string, params?: URLSearchParams) => {
    let url = `${API_BASE_URL + "/api"}${endpoint}`;
    const query = params ? `?${params.toString()}` : '';

    console.log("Fetching from URL:", url + query);

    try {
        const response = await axios.get(url + query);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Error fetching data:", error.message);
            throw new Error(`Failed to fetch data: ${error.message}`);
        } else {
            console.error("Unknown error fetching data:", error);
            throw new Error('An unknown error occurred while fetching data');
        }
    }
};

