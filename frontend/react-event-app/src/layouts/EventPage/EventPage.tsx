import {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {EventModel} from "../HomePage/models/EventModel";
import {fetchEventById} from "../../api/eventApi";
import './css/EventPage.css';
import {MapComponent} from "../HomePage/components/map/MapComponent";
import {EventPageMap} from "./components/EventPageMap"; // Import MapComponent

export const EventPage = () => {
    const {eventId} = useParams<{ eventId: string }>();
    const [event, setEvent] = useState<EventModel | null>(null);
    const [isLoadingEvent, setIsLoadingEvent] = useState(true);
    const [httpError, setHttpError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvent = async () => {
            setIsLoadingEvent(true);
            try {
                const eventData = await fetchEventById(`${eventId}`);
                setEvent(eventData);
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
                {/* Left Column - Event Details with scroll */}
                <div className="col-md-6 d-flex flex-column" style={{height: '600px'}}>
                    <div className="card h-100" style={{overflowY: 'auto', maxHeight: '600px'}}>
                        <img
                            src={event.image || 'default-image.jpg'}
                            className="card-img-top"
                            alt={event.name}
                            style={{height: '300px', objectFit: 'cover'}}
                        />
                        <div className="card-body" style={{overflowY: 'auto', maxHeight: 'calc(100% - 300px)'}}>
                            <h5 className="card-title">{event.name}</h5>
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
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
