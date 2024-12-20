import {LOGIN_FAIL, LOGIN_SUCCESS, LOGOUT, REGISTER_FAIL, REGISTER_SUCCESS, SET_MESSAGE,} from "./types";
import AuthService from "../api/services/authService";

export const register = (
    username: string,
    email: string,
    password: string,
    cityId: number,
    categoriesId: number[]
) => (dispatch: any) => {
    return AuthService.register(username, email, password, cityId, categoriesId).then(
        (response) => {
            dispatch({
                type: REGISTER_SUCCESS,
            });

            dispatch({
                type: SET_MESSAGE,
                payload: response.data.message,
            });

            return Promise.resolve();
        },
        (error) => {
            const message =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString();

            dispatch({
                type: REGISTER_FAIL,
            });

            dispatch({
                type: SET_MESSAGE,
                payload: message,
            });

            return Promise.reject();
        }
    );
};

export const login = (username: string, password: string) => (dispatch: any) => {
    return AuthService.login(username, password).then(
        (data) => {
            dispatch({
                type: LOGIN_SUCCESS,
                payload: {user: data},
            });

            return Promise.resolve();
        },
        (error) => {
            const message =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString();

            dispatch({
                type: LOGIN_FAIL,
            });

            dispatch({
                type: SET_MESSAGE,
                payload: message,
            });

            return Promise.reject();
        }
    );
};

export const logout = () => (dispatch: any) => {
    AuthService.logout();

    dispatch({
        type: LOGOUT,
    });
};
