import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {EventModel} from "../HomePage/models/EventModel";
import {fetchEventById, fetchReactionCountByType} from "../../api/eventApi";
import {handleFavouriteEvent, isFavouriteEvent, handleEventReaction} from "../../api/services/userService";
import authService from "../../api/services/authService";
import {Modal, Button} from 'react-bootstrap';
import {FaThumbsUp, FaStar, FaThumbsDown} from 'react-icons/fa'; // Import the icons
import {PiHeartFill} from "react-icons/pi";
import './css/EventPage.css';
import {EventPageMap} from "./components/EventPageMap";

export const EventPage = () => {
    const {eventId} = useParams<{ eventId: string }>();
    const navigate = useNavigate();

    const [event, setEvent] = useState<EventModel | null>(null);
    const [isLoadingEvent, setIsLoadingEvent] = useState(true);
    const [httpError, setHttpError] = useState<string | null>(null);
    const [isFavourite, setIsFavourite] = useState<boolean>(false);
    const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState<boolean>(false);
    const [userReaction, setUserReaction] = useState<string | null>(null);
    const [reactionCounts, setReactionCounts] = useState({
        LIKE: 0,
        INTERESTED: 0,
        DISLIKE: 0,
    });

    const checkAuthentication = () => {
        const user = authService.getCurrentUser();
        return user !== null;
    };

    const fetchReactionCounts = async () => {
        try {
            const likeCount = await fetchReactionCountByType(parseInt(eventId!), 'LIKE');
            const interestedCount = await fetchReactionCountByType(parseInt(eventId!), 'INTERESTED');
            const dislikeCount = await fetchReactionCountByType(parseInt(eventId!), 'DISLIKE');

            setReactionCounts({
                LIKE: likeCount,
                INTERESTED: interestedCount,
                DISLIKE: dislikeCount,
            });
        } catch (error) {
            console.error('Error fetching reaction counts:', error);
        }
    };

    useEffect(() => {
        const fetchEvent = async () => {
            setIsLoadingEvent(true);
            try {
                const eventData = await fetchEventById(`${eventId}`);
                setEvent(eventData);

                const isAuth = checkAuthentication();
                setIsAuthenticated(isAuth);

                if (isAuth) {
                    const favouriteStatus = await isFavouriteEvent(parseInt(eventId!));
                    setIsFavourite(favouriteStatus);
                }

                fetchReactionCounts();
            } catch (error) {
                setHttpError("Failed to load event data");
            } finally {
                setIsLoadingEvent(false);
            }
        };

        if (eventId) {
            fetchEvent();
        }
    }, [eventId]);

    const handleFavouriteClick = async () => {
        if (isTogglingFavorite || !eventId) return;

        if (!isAuthenticated) {
            setShowLoginPrompt(true);
            return;
        }

        setIsTogglingFavorite(true);
        try {
            await handleFavouriteEvent(parseInt(eventId));
            setIsFavourite(!isFavourite);
        } catch (error) {
            console.error("Error toggling favorite event status:", error);
        } finally {
            setIsTogglingFavorite(false);
        }
    };

    const handleReactionClick = async (reactionType: string) => {
        if (!isAuthenticated) {
            setShowLoginPrompt(true);
            return;
        }

        try {
            await handleEventReaction(parseInt(eventId!), reactionType);
            setUserReaction(reactionType);

            fetchReactionCounts();
        } catch (error) {
            console.error(`Error handling reaction: ${reactionType}`, error);
        }
    };

    if (isLoadingEvent) {
        return <div>Loading...</div>;
    }

    if (httpError) {
        return <div>{httpError}</div>;
    }

    if (!event) {
        return <div>No event found</div>;
    }

    const coordinates = {
        lat: event.location.latitude,
        lon: event.location.longitude,
    };

    return (
        <div className="container mt-4">
            <div className="row" style={{display: 'flex', height: '600px'}}>
                <div className="col-md-6 d-flex flex-column" style={{height: '600px'}}>
                    <div className="card h-100" style={{overflowY: 'auto', maxHeight: '600px'}}>
                        <img
                            src={event.image || 'default-image.jpg'}
                            className="card-img-top"
                            alt={event.name}
                            style={{height: '300px', objectFit: 'cover'}}
                        />
                        <div className="card-body" style={{overflowY: 'auto', maxHeight: 'calc(100% - 300px)'}}>
                            <h5 className="card-title">
                                {event.name}
                                <span
                                    className={`heart-icon ${isFavourite ? 'favorited' : 'not-favorite'}`}
                                    style={{
                                        cursor: isTogglingFavorite ? 'not-allowed' : 'pointer',
                                    }}
                                    onClick={handleFavouriteClick}
                                >
            {isFavourite ? <PiHeartFill className="favorited"/> : <PiHeartFill className="not-favorite"/>}
                </span>
                            </h5>
                            <p className="card-text">{event.description}</p>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 d-flex flex-column" style={{height: '100%'}}>
                    <div style={{height: '300px', width: '100%', flexShrink: 0, marginBottom: '20px'}}>
                        <EventPageMap events={[event]} cityCoordinates={coordinates}/>
                    </div>

                    <div className="card" style={{flexGrow: 1, marginTop: '40px'}}>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <p><strong>Start Date:</strong> {event.startDate}</p>
                                    <p><strong>End Date:</strong> {event.endDate}</p>
                                </div>
                                <div className="col-md-6">
                                    <p><strong>Category:</strong> {event.category.eventCategory}</p>
                                    <p><strong>Location:</strong> {event.location.name}</p>
                                    <p>
                                        <strong>Address:</strong> {event.location.address.street}, {event.location.address.city.name}
                                    </p>
                                </div>
                            </div>
                            <div className="reaction-icons">
                                <span
                                    className={userReaction === 'LIKE' ? 'selected-reaction' : ''}
                                    style={{cursor: 'pointer', fontSize: '1.5em', marginRight: '10px'}}
                                    onClick={() => handleReactionClick('LIKE')}
                                >
                                    <FaThumbsUp/> {reactionCounts.LIKE}
                                </span>
                                <span
                                    className={userReaction === 'INTERESTED' ? 'selected-reaction' : ''}
                                    style={{cursor: 'pointer', fontSize: '1.5em', marginRight: '10px'}}
                                    onClick={() => handleReactionClick('INTERESTED')}
                                >
                                    <FaStar/> {reactionCounts.INTERESTED}
                                </span>
                                <span
                                    className={userReaction === 'DISLIKE' ? 'selected-reaction' : ''}
                                    style={{cursor: 'pointer', fontSize: '1.5em', marginRight: '10px'}}
                                    onClick={() => handleReactionClick('DISLIKE')}
                                >
                                    <FaThumbsDown/> {reactionCounts.DISLIKE}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showLoginPrompt} onHide={() => setShowLoginPrompt(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Please Log In</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    You need to be logged in to add this event to your favorites.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowLoginPrompt(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={() => navigate('/login')}>
                        Log In
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};
