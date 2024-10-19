import React, { useEffect } from "react";
import { Navigate } from 'react-router-dom';
import authService from "../../api/services/authService";
import { useDispatch } from "react-redux";
import { logout } from "../../actions/auth";
import {AppDispatch} from "../../store";
import {toast} from "react-toastify";

export const Profile: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const currentUser = authService.getCurrentUser();

    useEffect(() => {
        if (!currentUser) {
            toast.error("Session expired. Redirecting to home page.");
            dispatch(logout());
        }
    }, [currentUser, dispatch]);

    if (!currentUser) {
        return <Navigate to="/home" />;
    }

    return (
        <div className="container">
            <header className="jumbotron">
                <h3>
                    <strong>{currentUser.username}</strong>'s Profile
                </h3>
            </header>
            <p>
                <strong>Token:</strong> {currentUser.token}
            </p>
            <p>
                <strong>Refresh Token:</strong> {currentUser.refreshToken}
            </p>
            <p>
                <strong>Id:</strong> {currentUser.id}
            </p>
            <p>
                <strong>Email:</strong> {currentUser.email}
            </p>
            <strong>Authorities:</strong>
            <ul>
                {currentUser.roles &&
                    currentUser.roles.map((role: string, index: number) => (
                        <li key={index}>{role}</li>
                    ))}
            </ul>
        </div>
    );
};
