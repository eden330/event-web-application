import React, {useEffect, useState, useCallback} from "react";
import {Navigate} from 'react-router-dom';
import {useDispatch} from "react-redux";
import {logout} from "../../actions/auth";
import {fetchUserProfile, deleteAccount, updateUserPreferences} from "../../api/services/userService";
import {AppDispatch} from "../../store";
import {UserProfileModel} from "./models/UserProfileModel";
import {Button, Card, Row, Col, Modal, Form} from 'react-bootstrap';
import {CategoryModel} from "../HomePage/models/CategoryModel";
import {CityModel} from "../HomePage/models/CityModel";
import {fetchCategories, fetchCities} from "../../api/eventApi";
import {UpdateRequest} from "../../api/services/models/UpdateRequest";
import {useNavigate} from 'react-router-dom';

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
    const [categoryError, setCategoryError] = useState<string | null>(null);
    const navigate = useNavigate();


    const loadProfile = useCallback(async () => {
        setLoading(true);
        try {
            const response: UserProfileModel = await fetchUserProfile();
            setProfileData(response);

            if (response.userInformationDto?.categories) {
                setSelectedCategories(response.userInformationDto.categories.map((cat) => cat.id));
            }
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
        loadCitiesAndCategories();
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
            return;
        }

        if (selectedCategories.length > 3) {
            setCategoryError("Please select between 1 and 3 categories.");
            return;
        }

        const updateRequest: UpdateRequest = {
            username: profileData.username,
            email: profileData.email,
            categoriesId: selectedCategories,
            cityId: selectedCity !== null ? selectedCity : null,
        };

        try {
            await updateUserPreferences(updateRequest);

            console.log("Preferences updated successfully!");

            const updatedProfileData: UserProfileModel = await fetchUserProfile();
            setProfileData(updatedProfileData);

            if (updatedProfileData.userInformationDto?.categories) {
                setSelectedCategories(updatedProfileData.userInformationDto.categories.map((cat) => cat.id));
            }

            setShowPreferencesModal(false);
        } catch (error) {
            console.error("Failed to update preferences:", error);
        }
    };


    if (error) {
        return <Navigate to="/home"/>;
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
                                    <Button
                                        variant="primary"
                                        onClick={() => navigate('/recommended')}>
                                        View Recommended Events
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
                                    <p>
                                        <strong>City:</strong> {profileData.userInformationDto?.city ? profileData.userInformationDto.city.name : "City not specified"}
                                    </p>
                                    <p>
                                        <strong>Categories:</strong> {profileData.userInformationDto?.categories && profileData.userInformationDto.categories.length > 0
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
                                    <Button
                                        variant="primary"
                                        onClick={() => navigate('/favourites')}>
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
                            <Form.Label>Select Categories (Up to 3)</Form.Label>
                            {categories.map((category) => (
                                <Form.Check
                                    key={category.id}
                                    type="checkbox"
                                    label={category.eventCategory}
                                    checked={selectedCategories.includes(category.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedCategories((prev) => {
                                                if (prev.length < 3) {
                                                    setCategoryError(null);
                                                    return [...prev, category.id];
                                                } else {
                                                    setCategoryError("You can only select up to 3 categories.");
                                                    return prev;
                                                }
                                            });
                                        } else {
                                            setSelectedCategories((prev) => prev.filter((id) => id !== category.id));
                                            setCategoryError(null);
                                        }
                                    }}
                                />
                            ))}

                            {categoryError && (
                                <div className="text-danger mt-2">{categoryError}</div>
                            )}
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
