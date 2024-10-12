const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const fetchEventsMap = async (cityName?: string, category?: string) => {
    const params = new URLSearchParams();
    if (cityName) params.append('cityName', cityName);
    if (category) params.append('category', category);

    const url = `${API_BASE_URL}/events/map?${params.toString()}`;
    console.log("Fetching from URL (Map):", url);

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Error fetching map events from the backend');
    }

    return await response.json();
};

export const fetchEventsList = async (page: number, size: number, cityName?: string, category?: string) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (cityName) params.append('cityName', cityName);
    if (category) params.append('category', category);

    const url = `${API_BASE_URL}/events/list?${params.toString()}`;
    console.log("Fetching from URL (List):", url);

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Error fetching list events from the backend');
    }

    return await response.json();
};

export const fetchEventCount = async () => {
    const response = await fetch(`${API_BASE_URL}/events/count`);
    if (!response.ok) {
        throw new Error('Error fetching event count from the backend');
    }
    return await response.json();
};

export const fetchCities = async () => {
    const response = await fetch(`${API_BASE_URL}/cities/all`);
    if (!response.ok) {
        throw new Error('Error fetching cities from the backend');
    }
    return await response.json();
};

export const fetchCity = async (cityName?: string) => {
    const response = await fetch(`${API_BASE_URL}/cities?cityName=${cityName}`);
    if (!response.ok) {
        throw new Error('Error fetching city by name');
    }
    return await response.json();
};

export const fetchCategories = async () => {
    const response = await fetch(`${API_BASE_URL}/categories/all`);
    if (!response.ok) {
        throw new Error('Error fetching categories from the backend');
    }
    return await response.json();
};

