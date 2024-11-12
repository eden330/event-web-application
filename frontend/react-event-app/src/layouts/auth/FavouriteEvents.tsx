import React, {useEffect, useState} from "react";
import {fetchFavouriteEvents, handleFavouriteEvent} from "../../api/services/userService";
import {Button, Card, Col, Row} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom';
import {FavouriteEventModel} from "../../api/services/models/FavouriteEvent";
import {PiHeartFill} from "react-icons/pi";
import './css/FavouriteEvents.css';

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


    return (
        <div className="container my-5 favourite-events-container">
            {favouriteEvents.length === 0 ? (
                <div className="no-favourites-message">
                    <p>You have no favorite events yet.</p>
                    <p>Start exploring and add some events to your favorites!</p>
                    <Button
                        onClick={() => navigate('/home')}
                        className="go-home-btn"
                    >
                        Go to Home Page
                    </Button>
                </div>
            ) : (
                <Row>
                    {favouriteEvents.map((event) => (
                        <Col md={4} key={event.id}>
                            <Card className="mb-3 shadow-sm favourite-card">
                                <Card.Img
                                    variant="top"
                                    src={event.image || 'default-image.jpg'}
                                    alt={event.name}
                                    className="favourite-card-img"
                                />

                                <Card.Body className="d-flex flex-column justify-content-between">
                                    <Card.Title className="event-title">{event.name}</Card.Title>
                                    <Card.Text>{event.category.eventCategory}</Card.Text>

                                    <Button
                                        onClick={() => navigate(`/event/${event.id}/${encodeURIComponent(event.name)}`)}
                                        className="view-event-btn"
                                    >
                                        View Event
                                    </Button>
                                </Card.Body>

                                <PiHeartFill
                                    className="heart-icon-delete"
                                    onClick={() => handleRemoveFavourite(event.id)}
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );


};
