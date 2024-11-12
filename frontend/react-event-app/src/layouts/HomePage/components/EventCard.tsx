import React, {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {EventModel} from "../models/EventModel";
import {fetchReactionCountByType} from "../../../api/eventApi";
import {fetchReactedEvents, handleEventReaction} from "../../../api/services/userService";
import authService from "../../../api/services/authService";
import {Button, Modal} from "react-bootstrap";
import '../css/EventCard.css';

interface EventCardProps {
    event: EventModel;
    onSwipeLeft: (event: EventModel) => void;
}

export const EventCard: React.FC<EventCardProps> = ({event, onSwipeLeft}) => {
    const [reactionCounts, setReactionCounts] = useState({
        LIKE: 0,
        INTERESTED: 0,
        DISLIKE: 0,
    });
    const [userReaction, setUserReaction] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState<boolean>(false);
    const [reactedEvents, setReactedEvents] = useState<Map<number, string>>(new Map());
    const navigate = useNavigate();

    const [startX, setStartX] = useState<number | null>(null);
    const [dragDistance, setDragDistance] = useState(0);
    const swipeThreshold = 700;
    const maxSwipeDistance = 800;

    // Check if user is authenticated
    useEffect(() => {
        const user = authService.getCurrentUser();
        setIsAuthenticated(user !== null);
    }, []);

    useEffect(() => {
        const fetchReactions = async () => {
            try {
                const likeCount = await fetchReactionCountByType(event.id, 'LIKE');
                const interestedCount = await fetchReactionCountByType(event.id, 'INTERESTED');
                const dislikeCount = await fetchReactionCountByType(event.id, 'DISLIKE');

                setReactionCounts({
                    LIKE: likeCount,
                    INTERESTED: interestedCount,
                    DISLIKE: dislikeCount,
                });
            } catch (error) {
                console.error("Error fetching reaction counts:", error);
            }
        };

        fetchReactions();
    }, [event.id]);

    useEffect(() => {
        const fetchReactedEventsData = async () => {
            try {
                const reactedEventsData = await fetchReactedEvents();
                const reactedEventsMap = new Map<number, string>();

                reactedEventsData.forEach((eventDto) => {
                    reactedEventsMap.set(eventDto.eventId, eventDto.reactionType);
                });

                setReactedEvents(reactedEventsMap);
            } catch (error) {
                console.error("Error fetching reacted events:", error);
            }
        };

        if (isAuthenticated) {
            fetchReactedEventsData();
        }
    }, [isAuthenticated]);

    const handleReactionClick = async (reactionType: string) => {
        if (!isAuthenticated) {
            setShowLoginPrompt(true);
            return;
        }

        if (reactedEvents.has(event.id) && reactedEvents.get(event.id) === reactionType) {
            reactedEvents.delete(event.id);
            setReactedEvents(new Map(reactedEvents));
            setUserReaction(null);
        } else {
            reactedEvents.set(event.id, reactionType);
            setReactedEvents(new Map(reactedEvents));
            setUserReaction(reactionType);
        }

        try {
            await handleEventReaction(event.id, reactionType);
            const likeCount = await fetchReactionCountByType(event.id, 'LIKE');
            const interestedCount = await fetchReactionCountByType(event.id, 'INTERESTED');
            const dislikeCount = await fetchReactionCountByType(event.id, 'DISLIKE');

            setReactionCounts({
                LIKE: likeCount,
                INTERESTED: interestedCount,
                DISLIKE: dislikeCount,
            });
        } catch (error) {
            console.error(`Error handling reaction: ${reactionType}`, error);
        }
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        setStartX(e.clientX);
        e.currentTarget.setPointerCapture(e.pointerId);
        e.preventDefault();
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (startX === null) return;

        const distance = startX - e.clientX;
        const clampedDistance = Math.min(distance, maxSwipeDistance);

        setDragDistance(clampedDistance > 0 ? clampedDistance : 0);

        if (distance > swipeThreshold) {
            onSwipeLeft(event);
            setDragDistance(0);
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        setStartX(null);
        setDragDistance(0);
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    const getCategoryIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case 'music':
                return 'fas fa-music';
            case 'plays':
                return 'fas fa-theater-masks';
            case 'exhibitions':
                return 'fas fa-palette';
            default:
                return 'fas fa-calendar';
        }
    };

    const getUserReaction = (eventId: number): string | null => {
        return reactedEvents.get(eventId) || null;
    };

    return (
        <div
            className="event-card shadow bg-body rounded"
            style={{
                transform: `translateX(-${Math.min(dragDistance, maxSwipeDistance)}px)`,
                transition: dragDistance === 0 ? "transform 0.3s ease-out" : "none",
            }}
        >
            <Link
                to={`/event/${event.id}/${encodeURIComponent(event.name)}`}
                style={{textDecoration: "none"}}
            >
                <img
                    src={event.image || 'default-image.jpg'}
                    alt={event.name}
                    className="card-image"
                />
            </Link>

            <div className="card-content">
                <Link
                    to={`/event/${event.id}/${encodeURIComponent(event.name)}`}
                    style={{textDecoration: "none", color: "inherit"}}
                >
                    <h6 className="card-title">{event.name}</h6>
                </Link>

                <div className="card-location">
                    <i className="fas fa-map-marker-alt city-icon"></i> {/* City icon */}
                    {event.location.address.city.name}

                    <i className={`${getCategoryIcon(event.category.eventCategory)} category-icon`}></i> {/* Category icon */}
                    {event.category.eventCategory}
                </div>
                <div className="card-dates">
                    <i className="fas fa-calendar-alt calendar-icon"></i>
                    <p>{`${new Date(event.startDate).toLocaleDateString('pl-PL')} - ${new Date(event.endDate).toLocaleDateString('pl-PL')}`}</p>
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

            <div
                className="drag-handle"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
            ></div>

            <Modal show={showLoginPrompt} onHide={() => setShowLoginPrompt(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Please Log In</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    You need to be logged in to react to this event. Would you like to log in now?
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
