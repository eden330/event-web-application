import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EventModel } from "../models/EventModel";
import { fetchReactionCountByType } from "../../../api/eventApi";
import { handleEventReaction } from "../../../api/services/userService";
import authService from "../../../api/services/authService";
import { Modal, Button } from "react-bootstrap";

interface EventCardProps {
    event: EventModel;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
    const [reactionCounts, setReactionCounts] = useState({
        LIKE: 0,
        INTERESTED: 0,
        DISLIKE: 0,
    });

    const [userReaction, setUserReaction] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState<boolean>(false);
    const navigate = useNavigate();

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

    const handleReactionClick = async (reactionType: string) => {
        if (!isAuthenticated) {
            setShowLoginPrompt(true);
            return;
        }

        try {
            await handleEventReaction(event.id, reactionType);
            setUserReaction(reactionType);

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

    return (
        <div>
            <div className="card shadow p-2 m-2 bg-body rounded">
                <div className="row g-0 p-1">
                    <div className="col-auto d-flex align-items-center">
                        <Link
                            to={`/event/${event.id}/${encodeURIComponent(event.name)}`}
                            style={{ textDecoration: "none" }}
                        >
                            <img
                                src={event.image || 'default-image.jpg'}
                                alt={event.name}
                                className="card-image"
                            />
                        </Link>
                    </div>
                    <div className="col-md-6">
                        <div className="card-body p-1">
                            <Link
                                to={`/event/${event.id}/${encodeURIComponent(event.name)}`}
                                style={{ textDecoration: "none", color: "inherit" }}
                            >
                                <h6 className="card-title">{event.name}</h6>
                            </Link>
                            <p className={"card-text"}>{event.location.address.city.name}</p>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <p> Start date:{new Date(event.startDate).toLocaleDateString('pl-PL')}</p>
                        <p> End date:{new Date(event.endDate).toLocaleDateString('pl-PL')}</p>
                    </div>
                </div>

                <div className="row g-0 p-1 d-flex justify-content-between">
                    <div className="d-flex align-items-center justify-content-start">
                        <span
                            style={{ marginRight: "10px", cursor: "pointer" }}
                            className={userReaction === 'LIKE' ? 'selected-reaction' : ''}
                            onClick={() => handleReactionClick('LIKE')}
                        >
                            👍 {reactionCounts.LIKE}
                        </span>
                        <span
                            style={{ marginRight: "10px", cursor: "pointer" }}
                            className={userReaction === 'INTERESTED' ? 'selected-reaction' : ''}
                            onClick={() => handleReactionClick('INTERESTED')}
                        >
                            ⭐ {reactionCounts.INTERESTED}
                        </span>
                        <span
                            style={{ marginRight: "10px", cursor: "pointer" }}
                            className={userReaction === 'DISLIKE' ? 'selected-reaction' : ''}
                            onClick={() => handleReactionClick('DISLIKE')}
                        >
                            👎 {reactionCounts.DISLIKE}
                        </span>
                    </div>
                </div>
            </div>

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
