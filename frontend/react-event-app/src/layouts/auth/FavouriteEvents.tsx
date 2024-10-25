import React, { useState, useEffect } from "react";
import { fetchFavouriteEvents, handleFavouriteEvent } from "../../api/services/userService";
import { Card, Button, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FavouriteEventModel } from "../../api/services/models/FavouriteEvent";
import { PiHeartFill } from "react-icons/pi";
import './css/Auth.css'; // Rename the CSS file to a more appropriate name

export const FavouriteEvents: React.FC = () => {
    const [favouriteEvents, setFavouriteEvents] = useState<FavouriteEventModel[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const events = await fetchFavouriteEvents();
                setFavouriteEvents(events);
            } catch (err) {
                setError("Failed to fetch favourite events.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleRemoveFavourite = async (eventId: number) => {
        try {
            await handleFavouriteEvent(eventId);
            setFavouriteEvents((prevEvents) => prevEvents.filter(event => event.id !== eventId));
        } catch (error) {
            console.error("Error removing event from favourites: ", error);
            setError("Failed to remove event from favourites.");
        }
    };

    if (loading) {
        return <div>Loading favourite events...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (favouriteEvents.length === 0) {
        return <div>No favourite events found.</div>;
    }

    return (
        <div className="container my-5">
            <Row>
                {favouriteEvents.map((event) => (
                    <Col md={4} key={event.id}>
                        <Card className="mb-3 shadow-sm favourite-card">
                            {/* Clickable event photo */}
                            <Link to={`/event/${event.id}/${encodeURIComponent(event.name)}`}>
                                <Card.Img
                                    variant="top"
                                    src={event.image || 'default-image.jpg'}
                                    alt={event.name}
                                    className="favourite-card-img"
                                    style={{ cursor: 'pointer' }}
                                />
                            </Link>

                            <Card.Body className="d-flex flex-column justify-content-between">
                                <div className="d-flex justify-content-between align-items-center">
                                    {/* Clickable event name */}
                                    <Link
                                        to={`/event/${event.id}/${encodeURIComponent(event.name)}`}
                                        style={{ textDecoration: 'none', color: 'inherit' }}
                                    >
                                        <Card.Title className="event-title">{event.name}</Card.Title>
                                    </Link>
                                </div>
                                <Card.Text>
                                    {event.category.eventCategory}
                                </Card.Text>
                                <Link to={`/event/${event.id}/${encodeURIComponent(event.name)}`}>
                                    <Button variant="primary">View Event</Button>
                                </Link>
                            </Card.Body>

                            {/* Heart icon positioned in the bottom-right corner */}
                            <PiHeartFill
                                className="heart-icon-delete"
                                onClick={() => handleRemoveFavourite(event.id)}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};
