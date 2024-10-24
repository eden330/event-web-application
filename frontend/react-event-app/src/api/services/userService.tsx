import axiosInstance from './axiosInterceptor';
import {logout} from "./authService";
import {UpdateRequest} from "./models/UpdateRequest";

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