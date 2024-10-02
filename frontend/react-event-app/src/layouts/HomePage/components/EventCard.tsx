import React from "react";
import {EventDto} from "../../../dto/EventDto";

interface EventCardProps {
    event: EventDto;
}

export const EventCard: React.FC<EventCardProps> = ({event}) => {
    return (
        <div className="card shadow p-2 m-2 bg-body rounded">
            <div className="row g-0 p-1">
                <div className="col-auto d-flex align-items-center">
                    <img
                        src={event.imageUrl}
                        alt="label"
                        className="card-image"
                    />
                </div>
                <div className="col-md-6">
                    <div className="card-body p-1">
                        <h6 className="card-title">{event.title}</h6>
                        <p className="card-text">{event.description}</p>
                    </div>
                </div>
                <div className="col-md-3">
                    <p>Date: {event.startDate}</p>
                    <p>Location: {event.location}</p>
                </div>
            </div>
        </div>
    )
};