import React, { useEffect, useState, useCallback } from "react";
import { Navigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { logout } from "../../actions/auth";
import { fetchUserProfile, deleteAccount, updateUserPreferences } from "../../api/services/userService";
import { AppDispatch } from "../../store";
import { UserProfileModel } from "./models/UserProfileModel";
import { Button, Card, Row, Col, Modal, Form } from 'react-bootstrap';
import {CategoryModel} from "../HomePage/models/CategoryModel";
import {CityModel} from "../HomePage/models/CityModel";
import {fetchCategories, fetchCities} from "../../api/eventApi";
import {UpdateRequest} from "../../api/services/models/UpdateRequest";

export const Profile: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const [profileData, setProfileData] = useState<UserProfileModel | null>(null);
    const [cities, setCities] = useState<CityModel[]>([]);
    const [categories, setCategories] = useState<CategoryModel[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showPreferencesModal, setShowPreferencesModal] = useState<boolean>(false);
    const [selectedCity, setSelectedCity] = useState<number | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

    const loadProfile = useCallback(async () => {
        setLoading(true);
        try {
            const response: UserProfileModel = await fetchUserProfile();
            setProfileData(response);
        } catch (err) {
            setError("Failed to fetch profile data");
        } finally {
            setLoading(false);
        }
    }, []);

    const loadCitiesAndCategories = useCallback(async () => {
        try {
            const citiesResponse = await fetchCities();
            const categoriesResponse = await fetchCategories();
            setCities(citiesResponse);
            setCategories(categoriesResponse);
        } catch (err) {
            console.error("Failed to load cities or categories:", err);
        }
    }, []);

    useEffect(() => {
        loadProfile();
        loadCitiesAndCategories(); // Load cities and categories on mount
    }, [loadProfile, loadCitiesAndCategories]);

    useEffect(() => {
        if (error) {
            dispatch(logout());
        }
    }, [error, dispatch]);

    const handleDeleteAccount = async () => {
        try {
            await deleteAccount();
            dispatch(logout());
        } catch (err) {
            console.error("Failed to delete account:", err);
        } finally {
            setShowModal(false);
        }
    };

    const handleUpdatePreferences = async () => {
        if (!profileData) {
            console.error("Profile data is not available.");
            return; // Early return if profileData is null
        }

        const updateRequest: UpdateRequest = {
            username: profileData.username,
            email: profileData.email,
            categoriesId: selectedCategories,
            cityId: selectedCity !== null ? selectedCity : null, // Ensure this can be null
        };

        try {
            // Update preferences on the backend
            await updateUserPreferences(updateRequest);

            console.log("Preferences updated successfully!");

            // Reset selected categories after successful update
            setSelectedCategories([]); // Clear selected categories state
            setSelectedCity(null); // Optionally reset the selected city as well

            // Fetch the updated user profile to get the latest data
            const updatedProfileData: UserProfileModel = await fetchUserProfile();
            setProfileData(updatedProfileData); // Update the state with new profile data

            setShowPreferencesModal(false);
        } catch (error) {
            console.error("Failed to update preferences:", error);
        }
    };

    if (error) {
        return <Navigate to="/home" />;
    }

    return (
        <div className="container my-5">
            {loading ? (
                <div>Loading...</div>
            ) : (
                profileData ? (
                    <Row>
                        <Col md={4}>
                            <Card className="mb-3 shadow-sm">
                                <Card.Body>
                                    <Card.Title>Chosen Events</Card.Title>
                                    <Button variant="primary">
                                        View Chosen Events
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={4}>
                            <Card className="mb-3 shadow-sm">
                                <Card.Body>
                                    <Card.Title>User Profile</Card.Title>
                                    <p><strong>Username:</strong> {profileData.username}</p>
                                    <p><strong>Email:</strong> {profileData.email}</p>
                                    <p><strong>City:</strong> {profileData.userInformationDto?.city ? profileData.userInformationDto.city.name : "City not specified"}</p>
                                    <p><strong>Categories:</strong> {profileData.userInformationDto?.categories && profileData.userInformationDto.categories.length > 0
                                        ? profileData.userInformationDto.categories.map((cat) => cat.eventCategory).join(", ")
                                        : "No categories available"}</p>
                                    <Button
                                        variant="danger"
                                        className="mt-3"
                                        onClick={() => setShowModal(true)}
                                    >
                                        Remove Account
                                    </Button>
                                    <Button
                                        variant="primary"
                                        className="mt-3"
                                        onClick={() => setShowPreferencesModal(true)}
                                    >
                                        Change Preferences
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={4}>
                            <Card className="mb-3 shadow-sm">
                                <Card.Body>
                                    <Card.Title>Favourite Events</Card.Title>
                                    <Button variant="primary">
                                        View Favourite Events
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                ) : (
                    <div>No profile data available</div>
                )
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Account Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete your account? This action cannot be undone.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDeleteAccount}>
                        Delete Account
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Preferences Modal */}
            <Modal show={showPreferencesModal} onHide={() => setShowPreferencesModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Update Preferences</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formCity">
                            <Form.Label>Select City</Form.Label>
                            <Form.Control as="select" onChange={(e) => setSelectedCity(Number(e.target.value))}>
                                <option value="">Select a city</option>
                                {cities.map((city) => (
                                    <option key={city.id} value={city.id}>{city.name}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>

                        <Form.Group controlId="formCategories">
                            <Form.Label>Select Categories</Form.Label>
                            {categories.map((category) => (
                                <Form.Check
                                    key={category.id}
                                    type="checkbox"
                                    label={category.eventCategory}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedCategories(prev => [...prev, category.id]);
                                        } else {
                                            setSelectedCategories(prev => prev.filter(id => id !== category.id));
                                        }
                                    }}
                                />
                            ))}
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPreferencesModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleUpdatePreferences}>
                        Update Preferences
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};
