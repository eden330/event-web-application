import React, { useEffect, useState, useCallback } from "react";
import { Navigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { logout } from "../../actions/auth";
import { fetchUserProfile } from "../../api/services/userService";
import { toast } from "react-toastify";
import { AppDispatch } from "../../store";

export const Profile: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();

    const [profileData, setProfileData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const loadProfile = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetchUserProfile();
            setProfileData(response);
        } catch (err) {
            setError("Failed to fetch profile data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    useEffect(() => {
        if (error) {
            dispatch(logout());
        }
    }, [error, dispatch]);

    if (error) {
        return <Navigate to="/home" />;
    }

    return (
        <div className="profile-container">
            {loading ? (
                <div>Loading...</div>
            ) : (
                profileData ? (
                    <div>
                        <h1>User Profile</h1>
                        <p><strong>Username:</strong> {profileData.username}</p>
                        <p><strong>Email:</strong> {profileData.email}</p>
                        {profileData.userInformationDto && (
                            <div>
                                <p><strong>City:</strong> {profileData.userInformationDto.city.name}</p>
                                <p><strong>Categories:</strong> {profileData.userInformationDto.category.map((cat: any) => cat.name).join(", ")}</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div>No profile data available</div>
                )
            )}
        </div>
    );
};
