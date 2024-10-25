import axiosInstance from './axiosInterceptor';
import {logout} from "./authService";
import {UpdateRequest} from "./models/UpdateRequest";
import {FavouriteEventModel} from "./models/FavouriteEvent";

export const fetchUserProfile = async () => {
    try {
        const response = await axiosInstance.get('/api/users/profile',
            { withCredentials: true });
        console.log("Fetched user profile data: " + response.data)
        return response.data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};

export const deleteAccount = async (): Promise<void> => {
    try {
        await axiosInstance.post('/api/users/delete', {}, { withCredentials: true });
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
            { withCredentials: true });
    } catch (error) {
        console.error("Error updating user preferences:", error);
        throw error;
    }
};

export const handleFavouriteEvent = async (eventId: number): Promise<void> => {
    try {
        const response = await axiosInstance.post(`/api/users/handle-favourite-event/${eventId}`,
            {}, { withCredentials: true });
        console.log("Event added or deleted from favourite ones: ", response.data);
    } catch (error) {
        console.error("Error handling event to favourites:", error);
        throw error;
    }
};

export const isFavouriteEvent = async (eventId: number): Promise<boolean> => {
    try {
        const response = await axiosInstance.get(`/api/users/is-favourite-event/${eventId}`,
            { withCredentials: true });
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
                params: { reaction: reactionType },
                withCredentials: true
            });
        console.log(`Reaction ${reactionType} for event ${eventId} has been handled: `, response.data);
    } catch (error) {
        console.error("Error handling event reaction:", error);
        throw error;
    }
};