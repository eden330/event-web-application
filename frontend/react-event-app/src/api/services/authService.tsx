import axios from "axios";

const API_URL = process.env.REACT_APP_API_BASE_URL + "/api/users";

export interface AuthResponse {
    id: string;
    username: string;
    email: string;
    roles: string[];
    token: string;
    tokenType: string;
}

export const register = async (
    username: string,
    email: string,
    password: string,
    cityId: number,
    categoriesId: number[]
): Promise<any> => {
    return await axios.post(API_URL + "/register", {
        username,
        password,
        email,
        cityId,
        categoriesId,
    });
};

export const login = async (username: string, password: string): Promise<AuthResponse | null> => {
    const response = await axios.post<AuthResponse>(API_URL + "/login", {
        username,
        password,
    }, {
        withCredentials: true,
    });
    if (response.data.token) {
        console.log("User logged successfully: " + response.data)
        localStorage.setItem("user", JSON.stringify(response.data));

    }
    return response.data;
};

export const logout = async (): Promise<void> => {
    try {
        const currentUser = localStorage.getItem("user");
        if (currentUser) {
            const user = JSON.parse(currentUser);
            console.log("Calling logout API at:", API_URL + "/logout");

            await axios.post(`${API_URL}/logout`, null, { withCredentials: true });
            console.log("User logged out successfully.");
            localStorage.removeItem("user");
            window.location.reload();
        }
    } catch (error) {
        console.error("Error during logout", error);
    }
};

export const refreshAccessToken = async (): Promise<string> => {
    console.log('Token is expired, attempting to refresh...');
    try {
        const response = await axios.post(`${API_URL}/refreshtoken`, {}, {
            withCredentials: true,
        });
        console.log('New access token received:', response.data.accessToken);
        return response.data.accessToken;
    } catch (error) {
        console.error('Error refreshing access token:', error);
        throw error;
    }
};


export const saveNewAccessToken = (newAccessToken: string) => {
    const currentUser = getCurrentUser();
    if (currentUser) {
        console.log("Saving new access token to local Storage ");
        currentUser.token = newAccessToken;
        localStorage.setItem('user', JSON.stringify(currentUser));
    }
};

export const getCurrentUser = (): AuthResponse | null => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
        return JSON.parse(userStr);
    }
    return null;
};

export default {
    register,
    login,
    logout,
    getCurrentUser,
};
