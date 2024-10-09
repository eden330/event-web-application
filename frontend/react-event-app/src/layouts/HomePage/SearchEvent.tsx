import React, {useState, useEffect} from 'react';
import './css/SearchEvent.css';
import {EventSearchAndFilter} from "./components/EventSearchAndFilter";
import {MapComponent} from "./components/map/MapComponent";
import {EventCard} from "./components/EventCard";
import {EventModel} from "./models/EventModel";
import {EventModelMap} from "./models/map/EventModelMap";
import InfiniteScroll from "react-infinite-scroll-component";
import {fetchEventCount, fetchEventList, fetchEventMap} from "../../api/eventApi";

export const SearchEvent = () => {
    const [events, setEvents] = useState<EventModel[]>([]);
    const [eventsMap, setEventsMap] = useState<EventModelMap[]>([]);
    const [httpError, setHttpError] = useState(null);
    const [page, setPage] = useState(0);
    const numberOfEventsToFetch: number = 10;
    const [size] = useState(numberOfEventsToFetch);
    const [hasMore, setHasMore] = useState(true);
    const [totalEventsCount, setTotalEventsCount] = useState(0);

    const fetchEvents = async () => {
        if (!hasMore) return;

        try {

            const responseJson: EventModel[] = await fetchEventList(page, size);

            if (responseJson.length < size) {
                setHasMore(false);
            }

            setEvents((prevEvents) => [...prevEvents, ...responseJson]);
            setPage(prevPage => prevPage + 1);
        } catch (error: any) {
            setHttpError(error.message);
        }
    };

    const fetchEventsMap = async () => {
        try {
            const responseJson: EventModelMap[] = await fetchEventMap();

            setEventsMap(responseJson);
        } catch (error: any) {
            setHttpError(error.message);
        }
    };

    const fetchInitialEvents = async () => {
        setPage(0);
        setHasMore(true);
        setEvents([]);
        setEventsMap([]);
        await fetchEvents();
    };

    const countEvents = async () => {
        try {
            const eventCount = await fetchEventCount();
            setTotalEventsCount(eventCount);
        } catch (error: any) {
            setHttpError(error.message);
        }
    }


    useEffect(() => {
        const initialize = async () => {
            try {
                await countEvents();
                await fetchInitialEvents();
                await fetchEventsMap();
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
                console.error("Error caught:", errorMessage);
            }
        };

        initialize();
    }, []);

    if (httpError) {
        return (
            <div className="container m-5">
                <p>{httpError}</p>
            </div>
        );
    }

    return (
        <div className="d-flex flex-column">
            <EventSearchAndFilter/>
            <div className="container-fluid flex-grow-1">
                <div className="row">
                    <div className="col-12 col-md-6 p-0">
                        <MapComponent events={eventsMap}/>
                    </div>
                    <div className="col-12 col-md-6 p-3 event-list" id="scrollable-event-list">
                        <InfiniteScroll
                            dataLength={events.length}
                            next={fetchEvents}
                            hasMore={hasMore}
                            loader={<p>Loading more events...</p>}
                            scrollableTarget="scrollable-event-list">
                            {events.map(event => (
                                <EventCard event={event} key={event.id}/>
                            ))}
                        </InfiniteScroll>
                    </div>
                </div>
            </div>
        </div>
    );
};
