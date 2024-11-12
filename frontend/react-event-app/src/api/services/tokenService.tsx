import {jwtDecode} from "jwt-decode";

export const isTokenExpired = (token: string): boolean => {
    try {
        const decodedToken: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        console.log("Checking expiry of access token: " + (decodedToken.exp < currentTime))
        return decodedToken.exp < currentTime;
    } catch (error) {
        console.error("Error decoding token:", error);
        return true;
    }
}

