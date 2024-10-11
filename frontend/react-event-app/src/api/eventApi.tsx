const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const fetchEventsMap = async () => {
    const response = await fetch(`${API_BASE_URL}/events/map`);
    console.log("Fetching from URL: `${API_BASE_URL}/events/map`"); // Debug the URL
    if (!response.ok) {
        throw new Error('Error fetching events from the backend');
    }
    return await response.json();
};

export const fetchEventsList = async (page: number, size: number, cityName?: string) => {
    console.log("City in fetch method", cityName);
    const encodedCityName = cityName ? encodeURIComponent(cityName) : undefined;
    console.log("encoded in fetch method", encodedCityName);
    const url = encodedCityName
        ? `${API_BASE_URL}/events/list?page=${page}&size=${size}&cityName=${cityName}`
        : `${API_BASE_URL}/events/list?page=${page}&size=${size}`;

    console.log("Fetching from URL: ", url); // Debug the URL
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Error fetching events by city name from the backend');
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
    const response = await fetch(`${API_BASE_URL}/cities`);
    if (!response.ok) {
        throw new Error('Error fetching cities from the backend');
    }
    return await response.json();
};

