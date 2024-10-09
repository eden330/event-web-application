const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const fetchEventList = async (page: number, size: number) => {
    const response = await fetch(`${API_BASE_URL}/events/list?page=${page}&size=${size}`);
    if (!response.ok) {
        throw new Error('Error fetching events from the backend');
    }
    return await response.json();
};

export const fetchEventMap = async () => {
    const response = await fetch(`${API_BASE_URL}/events/map`);
    if (!response.ok) {
        throw new Error('Error fetching events from the backend');
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