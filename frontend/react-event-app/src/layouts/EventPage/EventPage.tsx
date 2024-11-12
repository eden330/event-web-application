import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {EventModel} from "../HomePage/models/EventModel";
import {fetchEventById, fetchReactionCountByType} from "../../api/eventApi";
import {
    fetchReactedEvents,
    handleEventReaction,
    handleFavouriteEvent,
    isFavouriteEvent
} from "../../api/services/userService";
import authService from "../../api/services/authService";
import {Button, Modal} from "react-bootstrap";
import {PiHeartFill} from "react-icons/pi";
import "./css/EventPage.css";
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
    const [reactedEvents, setReactedEvents] = useState<Map<number, string>>(new Map());

    const checkAuthentication = () => {
        const user = authService.getCurrentUser();
        return user !== null;
    };

    const fetchReactionCounts = async () => {
        try {
            const likeCount = await fetchReactionCountByType(parseInt(eventId!), "LIKE");
            const interestedCount = await fetchReactionCountByType(parseInt(eventId!), "INTERESTED");
            const dislikeCount = await fetchReactionCountByType(parseInt(eventId!), "DISLIKE");

            setReactionCounts({
                LIKE: likeCount,
                INTERESTED: interestedCount,
                DISLIKE: dislikeCount,
            });
        } catch (error) {
            console.error("Error fetching reaction counts:", error);
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
                    await fetchReactedEventsData();
                }

                fetchReactionCounts();
            } catch (error) {
                setHttpError("Failed to load event data");
            } finally {
                setIsLoadingEvent(false);
            }
        };

        const fetchReactedEventsData = async () => {
            try {
                const reactedEventsData = await fetchReactedEvents();
                const reactedEventsMap = new Map<number, string>();
                reactedEventsData.forEach((eventDto) => {
                    reactedEventsMap.set(eventDto.eventId, eventDto.reactionType);
                });
                setReactedEvents(reactedEventsMap);
                setUserReaction(reactedEventsMap.get(parseInt(eventId!)) || null);
            } catch (error) {
                console.error("Error fetching reacted events:", error);
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

        if (reactedEvents.has(parseInt(eventId!)) && reactedEvents.get(parseInt(eventId!)) === reactionType) {
            reactedEvents.delete(parseInt(eventId!));
            setReactedEvents(new Map(reactedEvents));
            setUserReaction(null);
        } else {
            reactedEvents.set(parseInt(eventId!), reactionType);
            setReactedEvents(new Map(reactedEvents));
            setUserReaction(reactionType);
        }

        try {
            await handleEventReaction(parseInt(eventId!), reactionType);
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

    const getUserReaction = (eventId: number): string | null => {
        return reactedEvents.get(eventId) || null;
    };

    const coordinates = {
        lat: event.location.latitude,
        lon: event.location.longitude,
    };

    return (
        <div className="container mt-4">
            <div className="row" style={{display: "flex", height: "600px"}}>
                <div className="col-md-6 d-flex flex-column" style={{height: "600px"}}>
                    <div className="card h-100" style={{overflowY: "auto", maxHeight: "600px"}}>
                        <img src={event.image || "default-image.jpg"} className="card-img-top" alt={event.name}
                             style={{height: "300px", objectFit: "cover"}}/>
                        <div className="card-body" style={{overflowY: "auto", maxHeight: "calc(100% - 300px)"}}>
                            <h5 className="card-title">
                                {event.name}
                                <span
                                    className={`heart-icon ${isFavourite ? "favorited" : "not-favorite"}`}
                                    style={{cursor: isTogglingFavorite ? "not-allowed" : "pointer"}}
                                    onClick={handleFavouriteClick}
                                >
                                {isFavourite ? <PiHeartFill className="favorited"/> :
                                    <PiHeartFill className="not-favorite"/>}
                            </span>
                            </h5>
                            <p className="card-text">{event.description}</p>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 d-flex flex-column" style={{height: "100%"}}>
                    <div style={{height: "300px", width: "100%", flexShrink: 0, marginBottom: "20px"}}>
                        <EventPageMap events={[event]} cityCoordinates={coordinates}/>
                    </div>

                    <div className="card" style={{flexGrow: 1, marginTop: "40px"}}>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <p><strong>Start
                                        Date:</strong> {new Date(event.startDate).toLocaleDateString('pl-PL', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                    })} {new Date(event.startDate).toLocaleTimeString('pl-PL', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}</p>
                                    <p><strong>End Date:</strong> {new Date(event.endDate).toLocaleDateString('pl-PL', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                    })} {new Date(event.endDate).toLocaleTimeString('pl-PL', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}</p>

                                </div>
                                <div className="col-md-6">
                                    <p><strong>Category:</strong> {event.category.eventCategory}</p>
                                    <p><strong>Location:</strong> {event.location.name}</p>
                                    <p>
                                        <strong>Address:</strong> {event.location.address.street}, {event.location.address.city.name}
                                    </p>
                                </div>
                            </div>
                            <div className="reactions">
                                <button
                                    className={`reaction-button ${getUserReaction(event.id) === 'LIKE' ? 'active' : ''}`}
                                    onClick={() => handleReactionClick('LIKE')}
                                >
                                    <i className="fas fa-thumbs-up"></i>
                                    <span className="reaction-count">{reactionCounts.LIKE}</span>
                                </button>
                                <button
                                    className={`reaction-button fire-button ${getUserReaction(event.id) === 'INTERESTED' ? 'active' : ''}`}
                                    onClick={() => handleReactionClick('INTERESTED')}
                                >
                                    <i className="fas fa-fire"></i>
                                    <span className="reaction-count">{reactionCounts.INTERESTED}</span>
                                </button>
                                <button
                                    className={`reaction-button ${getUserReaction(event.id) === 'DISLIKE' ? 'active' : ''}`}
                                    onClick={() => handleReactionClick('DISLIKE')}
                                >
                                    <i className="fas fa-thumbs-down"></i>
                                    <span className="reaction-count">{reactionCounts.DISLIKE}</span>
                                </button>
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
                    <Button variant="primary" onClick={() => navigate("/login")}>
                        Log In
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};
