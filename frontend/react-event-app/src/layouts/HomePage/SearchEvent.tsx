import React from 'react';
import './css/SearchEvent.css';
import {EventSearchAndFilter} from "./components/EventSearchAndFilter";
import {MapComponent} from "./components/MapComponent";
import {EventCard} from "./components/EventCard";


export const SearchEvent = () => {
    const event = {
        title: 'World Cup',
        description: 'Short description of the event',
        imageUrl: '/images/SearchEventImages/sport-icon.png',
        location: 'Wroclaw',
        category: 'Sport',
        startDate: '12.03.2024',
        endDate: '13.03.2024',
    };
    return (
        <div className="d-flex flex-column">
            <EventSearchAndFilter/>
            <div className="container-fluid flex-grow-1">
                <div className="row ">
                    <div className="col-12 col-md-6 p-0">
                        <MapComponent/>
                    </div>
                    <div className="col-12 col-md-6 p-3 event-list">
                        <EventCard event={event}/>
                        <EventCard event={event}/>
                        <EventCard event={event}/>
                        <EventCard event={event}/>
                        <EventCard event={event}/>
                        <EventCard event={event}/>
                        <EventCard event={event}/>
                        <EventCard event={event}/>
                        <EventCard event={event}/>
                    </div>
                </div>
            </div>
        </div>
    )
}


