const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const fetchEventsMap = async (cityName?: string, category?: string, searchTerm?: string) => {
    const params = new URLSearchParams();
    if (cityName) params.append('cityName', cityName);
    if (category) params.append('category', category);
    if (searchTerm) params.append('searchTerm', searchTerm);

    return await fetchFromApi("/events/map", params);
};

export const fetchEventsList = async (page: number, size: number, cityName?: string,
                                      category?: string, searchTerm?: string) => {
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

const fetchFromApi = async (endpoint: string, params?: URLSearchParams) => {
    let url = `${API_BASE_URL}${endpoint}`;
    if (params) {
        url += `?${params.toString()}`;
    }

    console.log("Fetching from URL:", url);

    try {
        const response = await fetch(url);
        if (response.ok) {
            const textResponse = await response.text();
            if (!textResponse || textResponse.trim() === "") {
                return [];
            }
            return JSON.parse(textResponse);
        } else if (response.status === 204) {
            return [];
        } else {
            throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error fetching data:", error.message);
            throw new Error(`Failed to fetch data: ${error.message}`);
        } else {
            console.error("Unknown error fetching data:", error);
            throw new Error('An unknown error occurred while fetching data');
        }
    }
};
