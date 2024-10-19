import axios from 'axios';
import { getCurrentUser, logout } from './authService';
import { toast } from 'react-toastify';
import {isTokenExpired} from "./tokenService";

const API_URL = process.env.REACT_APP_API_BASE_URL;

const axiosInstance = axios.create({
    baseURL: API_URL,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const currentUser = getCurrentUser();

        if (currentUser && currentUser.token) {
            config.headers['Authorization'] = 'Bearer ' + currentUser.token;

            if (isTokenExpired(currentUser.token)) {
                toast.error("Session expired, please login again.");
                logout();
                return Promise.reject(new Error("Token expired"));
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            toast.error("Unauthorized, please log in.");
            logout();
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
