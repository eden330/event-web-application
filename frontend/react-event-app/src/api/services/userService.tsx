import axiosInstance from './axiosInterceptor';

export const fetchUserProfile = async () => {
    try {
        const response = await axiosInstance.get('/api/users/profile', { withCredentials: true });
        console.log("Fetched user profile data: " + response.data)
        return response.data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};
