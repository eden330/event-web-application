import React, {useEffect, useState} from 'react';
import {EventModel} from "../HomePage/models/EventModel";
import {fetchRecommendedEvents} from "../../api/services/userService";
import './css/RecommendedEvents.css';
import {Link} from 'react-router-dom';

const RecommendedEvents: React.FC = () => {
    const [events, setEvents] = useState<EventModel[]>([]);
    const [page, setPage] = useState(0);
    const [currentSlide, setCurrentSlide] = useState(0);
    const pageSize = 5;

    useEffect(() => {
        fetchEvents(page);
    }, [page]);

    const fetchEvents = async (page: number) => {
        try {
            const newEvents = await fetchRecommendedEvents(page, pageSize);
            if (newEvents.length > 0) {
                setEvents(newEvents);
                setCurrentSlide(page === 0 ? 0 : pageSize - 1);
            } else {
                setPage(0);
            }
        } catch (error) {
            console.error("Failed to fetch recommended events:", error);
        }
    };

    const handleNext = () => {
        if (currentSlide === pageSize - 1) {
            setPage((prevPage) => prevPage + 1);

            setTimeout(() => {
                setCurrentSlide(0);
            }, 50);
        } else {
            setCurrentSlide((prevSlide) => prevSlide + 1);
        }
    };

    const handlePrev = () => {
        if (currentSlide === 0) {
            if (page > 0) {
                setPage((prevPage) => prevPage - 1);

                setTimeout(() => {
                    setCurrentSlide(pageSize - 1);
                }, 50);
            }
        } else {
            setCurrentSlide((prevSlide) => prevSlide - 1);
        }
    };

    return (
        <div className="recommended-events-container">
            <div className="recommended-events-header">
                <h2>Your Personalized Event Picks</h2>
                <p>Check out these events we think you'll love, tailored just for you!</p>
            </div>

            <div className="carousel-wrapper">
                <div className="carousel">
                    <ul
                        style={{
                            transform: `translateX(-${currentSlide * 100}%)`,
                            transition: "transform 0.5s ease",
                        }}
                    >
                        {events.map((event, index) => (
                            <li key={index}>
                                <Link
                                    to={`/event/${event.id}/${encodeURIComponent(event.name)}`}
                                    style={{textDecoration: "none"}}
                                >
                                    <img src={event.image} alt={event.name} className="event-image"/>
                                    <div className="event-info">
                                        <h3>{event.name}</h3>
                                        <p>📍 {event.location.address.city.name}</p>
                                        <p>Category: {event.category.eventCategory}</p>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="nav-dots">
                    {Array.from({length: pageSize}).map((_, index) => (
                        <span
                            key={index}
                            className={`nav-dot ${currentSlide === index ? 'active' : ''}`}
                            onClick={() => setCurrentSlide(index)}
                        ></span>
                    ))}
                </div>

                <button className="arrow left-arrow" onClick={handlePrev}>‹</button>
                <button className="arrow right-arrow" onClick={handleNext}>›</button>
            </div>
        </div>
    );
};

export default RecommendedEvents;
