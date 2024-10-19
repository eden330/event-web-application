
import { isTokenExpired } from "./tokenService";
import { toast } from "react-toastify";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_BASE_URL + "/users";

export interface AuthResponse {
    id: string;
    username: string;
    email: string;
    roles: string[];
    token: string;
    tokenType: string;
    refreshToken: string;
}

export const register = async (username: string, email: string, password: string): Promise<any> => {
    return await axios.post(API_URL + "/register", {
        username,
        password,
        email,
    });
};

export const login = async (username: string, password: string): Promise<AuthResponse | null> => {
    const response = await axios.post<AuthResponse>(API_URL + "/login", {
        username,
        password,
    });
    if (response.data.token) {
        localStorage.setItem("user", JSON.stringify(response.data));
    }
    return response.data;
};

export const logout = async (): Promise<void> => {
    try {
        const currentUser = localStorage.getItem("user");
        if (currentUser) {
            const user = JSON.parse(currentUser);
            console.log(user)
            await axios.post(`${API_URL}/logout`, { userId: user.id });

            localStorage.removeItem("user");

            toast.success("Logged out successfully.");
        }
    } catch (error) {
        console.error("Error during logout", error);
    }
};

export const getCurrentUser = (): AuthResponse | null => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
        const user = JSON.parse(userStr);

        if (isTokenExpired(user.token)) {
            toast.error("Session expired, redirecting to the login page...");
            console.log("Token expired, logging out.");
            logout();
            return null;
        }

        return user;
    }
    return null;
};

export default {
    register,
    login,
    logout,
    getCurrentUser,
};
