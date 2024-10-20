import axios from 'axios';
import {getCurrentUser, refreshAccessToken, saveNewAccessToken, logout} from './authService';
import {isTokenExpired} from './tokenService';
import {toast} from 'react-toastify';

const API_URL = process.env.REACT_APP_API_BASE_URL;
let toastShown = false;

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true
});

axiosInstance.interceptors.request.use(
    async (config) => {
        const currentUser = getCurrentUser();
        console.log('Current User:', currentUser);

        if (currentUser && currentUser.token) {
            let isExpired = isTokenExpired(currentUser.token);
            console.log('Token expiration check: ', isExpired);

            if (isExpired) {
                try {
                    const newAccessToken = await refreshAccessToken();
                    saveNewAccessToken(newAccessToken);

                    config.headers['Authorization'] = 'Bearer ' + newAccessToken;
                } catch (error) {
                    console.error("Token refresh failed", error);

                    if (!toastShown) {
                        toast.error("Session expired. Please login again.");
                        toastShown = true;
                    }
                    await logout();
                    return Promise.reject(error);
                }
            } else {
                console.log('Token is still valid - normal operation with Auth header');
                config.headers['Authorization'] = 'Bearer ' + currentUser.token;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const currentUser = getCurrentUser();

        if (error.response && error.response.status === 401 && currentUser && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const newAccessToken = await refreshAccessToken();
                saveNewAccessToken(newAccessToken);

                originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;

                return axiosInstance(originalRequest);
            } catch (refreshError) {
                if (!toastShown) {
                    toast.error("Session expired. Please login again.");
                    toastShown = true;
                }
                await logout();
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
