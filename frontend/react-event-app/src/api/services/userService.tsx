import axiosInstance from './axiosInterceptor';
import {logout} from "./authService";
import {UpdateRequest} from "./models/UpdateRequest";
import {FavouriteEventModel} from "./models/FavouriteEvent";
import {EventModel} from "../../layouts/HomePage/models/EventModel";
import {ReactedEventDto} from "../../layouts/auth/models/ReactedEventDto";

export const fetchUserProfile = async () => {
    try {
        const response = await axiosInstance.get('/api/users/profile',
            {withCredentials: true});
        console.log("Fetched user profile data: " + response.data)
        return response.data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};

export const deleteAccount = async (): Promise<void> => {
    try {
        await axiosInstance.post('/api/users/delete', {}, {withCredentials: true});
        console.log("Account deleted successfully.");
    } catch (error) {
        console.error("Error during account deletion:", error);
    } finally {
        await logout();
    }
};

export const updateUserPreferences = async (updateRequest: UpdateRequest): Promise<void> => {
    try {
        await axiosInstance.post('/api/users/update-preferences', updateRequest,
            {withCredentials: true});
    } catch (error) {
        console.error("Error updating user preferences:", error);
        throw error;
    }
};

export const handleFavouriteEvent = async (eventId: number): Promise<void> => {
    try {
        const response = await axiosInstance.post(`/api/users/handle-favourite-event/${eventId}`,
            {}, {withCredentials: true});
        console.log("Event added or deleted from favourite ones: ", response.data);
    } catch (error) {
        console.error("Error handling event to favourites:", error);
        throw error;
    }
};

export const isFavouriteEvent = async (eventId: number): Promise<boolean> => {
    try {
        const response = await axiosInstance.get(`/api/users/is-favourite-event/${eventId}`,
            {withCredentials: true});
        console.log(`Event ${eventId} is favourite: `, response.data);
        return response.data;
    } catch (error) {
        console.error("Error checking if event is favourite:", error);
        throw error;
    }
};

export const fetchFavouriteEvents = async (): Promise<FavouriteEventModel[]> => {
    try {
        const response = await axiosInstance.get('/api/users/favourite-events',
            {withCredentials: true});
        console.log("Fetched favourite events: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching favourite events: ", error);
        throw error;
    }
};

export const handleEventReaction = async (eventId: number, reactionType: string): Promise<void> => {
    try {
        const response = await axiosInstance.post(`/api/users/event/${eventId}/reaction`,
            null,
            {
                params: {reaction: reactionType},
                withCredentials: true
            });
        console.log(`Reaction ${reactionType} for event ${eventId} has been handled: `, response.data);
    } catch (error) {
        console.error("Error handling event reaction:", error);
        throw error;
    }
};

export const fetchRecommendedEvents = async (page = 0, size = 10): Promise<EventModel[]> => {
    try {
        const response = await axiosInstance.get('/api/users/event/recommendations', {
            params: {page, size},
            withCredentials: true,
        });
        console.log("Fetched recommended events: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching recommended events:", error);
        throw error;
    }
};

export const fetchReactedEvents = async (): Promise<ReactedEventDto[]> => {
    try {
        const response = await axiosInstance.get('/api/users/events/reactions', {withCredentials: true});
        console.log("Fetched reacted events: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching reacted events:", error);
        throw error;
    }
};

export const fetchAllUsers = async (): Promise<any[]> => {
    try {
        const response = await axiosInstance.get('/api/users', { withCredentials: true });
        console.log("Fetched all users: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching all users: ", error);
        throw error;
    }
};

export const deleteUser = async (userId: number): Promise<void> => {
    if (!userId) {
        console.error("Invalid userId provided to deleteUser");
        throw new Error("Invalid userId provided to deleteUser");
    }
    try {
        console.log(`Sending delete request for userId: ${userId}`);
        const response = await axiosInstance.post(`/api/users/delete/${userId}`, {}, { withCredentials: true });
        console.log(`User with ID ${userId} deleted successfully.`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting user with ID ${userId}:`, error);
        throw error;
    }
};

export const deleteEventById = async (eventId: number): Promise<void> => {
    try {
        console.log(`Sending request to delete event with ID: ${eventId}`);
        await axiosInstance.post(`/api/events/delete/${eventId}`, {}, { withCredentials: true });
        console.log(`Event with ID ${eventId} deleted successfully.`);
    } catch (error) {
        console.error(`Error deleting event with ID ${eventId}:`, error);
        throw error;
    }
};