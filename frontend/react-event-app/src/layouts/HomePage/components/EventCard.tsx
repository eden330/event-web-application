import React from "react";
import {EventModel} from "../models/EventModel";

interface EventCardProps {
    event: EventModel;
}

export const EventCard: React.FC<EventCardProps> = ({event}) => {
    return (
        <div className="card shadow p-2 m-2 bg-body rounded">
            <div className="row g-0 p-1">
                <div className="col-auto d-flex align-items-center">
                    <img
                        src={event.image}
                        alt="label"
                        className="card-image"
                    />
                </div>
                <div className="col-md-6">
                    <div className="card-body p-1">
                        <h6 className="card-title">{event.name}</h6>

                        <p className={"card-text"}>{event.location.address.city.name}</p>
                    </div>
                </div>
                <div className="col-md-3">
                    <p>Start date: {new Date(event.startDate).toLocaleDateString()}</p>
                    <p>End date: {new Date(event.endDate).toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    )
};