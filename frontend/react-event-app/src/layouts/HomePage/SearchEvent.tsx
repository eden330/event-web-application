import React, {useState, useEffect} from 'react';
import './css/SearchEvent.css';
import {EventSearchAndFilter} from "./components/EventSearchAndFilter";
import {MapComponent} from "./components/map/MapComponent";
import {EventCard} from "./components/EventCard";
import {EventModel} from "./models/EventModel";
import {EventModelMap} from "./models/map/EventModelMap";
import InfiniteScroll from "react-infinite-scroll-component";
import {fetchEventCount, fetchEventsMap, fetchEventsList} from "../../api/eventApi";

export const SearchEvent = () => {
    const [events, setEvents] = useState<EventModel[]>([]);
    const [eventsMap, setEventsMap] = useState<EventModelMap[]>([]);
    const [httpError, setHttpError] = useState(null);
    const [page, setPage] = useState(0);
    const numberOfEventsToFetch: number = 20;
    const [size] = useState(numberOfEventsToFetch);
    const [hasMore, setHasMore] = useState(true);
    const [totalEventsCount, setTotalEventsCount] = useState(0);
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [initialized, setInitialized] = useState(false);

    // Function to fetch events
    const fetchEvents = async (cityName: string | null = null) => {
        console.log("Fetching events for city: ", cityName);
        if (!hasMore) return;

        try {
            const responseJson: EventModel[] = await fetchEventsList(page, size, cityName || undefined);

            // Log the number of events returned to ensure data is consistent
            console.log("Number of events returned:", responseJson.length);

            // Update the events state
            setEvents((prevEvents) => [...prevEvents, ...responseJson]);

            // If no more events are fetched, stop future fetching
            if (responseJson.length === 0 || responseJson.length < size) {
                setHasMore(false);
            }

            // Update the page for the next fetch
            setPage(prevPage => prevPage + 1);
        } catch (error: any) {
            setHttpError(error.message);
        }
    };


    // Function to fetch map events
    const fetchEventsForMap = async () => {
        console.log("Fetching events for MAP: ");
        try {
            const responseJson: EventModelMap[] = await fetchEventsMap();
            setEventsMap(responseJson);
        } catch (error: any) {
            setHttpError(error.message);
        }
    };

    // Function to fetch initial events
    const fetchInitialEvents = async (cityName: string | null) => {
        console.log("Fetching initial events for city: ", cityName);
        setPage(0); // Reset the page count for new fetch
        setHasMore(true); // Reset hasMore for new city fetch
        setEvents([]); // Clear previous events
        setEventsMap([]); // Clear map data
        await fetchEvents(cityName);
    };

    // Count the total events
    const countEvents = async () => {
        try {
            const eventCount = await fetchEventCount();
            setTotalEventsCount(eventCount);
        } catch (error: any) {
            setHttpError(error.message);
        }
    }

    const onShowEvents = (cityName: string | null) => {
        console.log("City selected in modal: ", cityName);
        setHasMore(true);
        setPage(0);
        setSelectedCity(cityName);
    };


    // Fetch events on initialization (without city filter)
    useEffect(() => {
        const initialize = async () => {
            try {
                await countEvents();
                await fetchInitialEvents(null);
                await fetchEventsForMap();
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
                console.error("Error caught:", errorMessage);
            } finally {
                setInitialized(true);
            }
        };

        if (!initialized) {
            initialize();
        }
    }, [initialized]);

    // Fetch events when the selected city changes
    useEffect(() => {
        if (initialized && selectedCity !== null) {
            console.log("Triggering fetch for city: ", selectedCity);
            fetchInitialEvents(selectedCity);
        }
    }, [selectedCity, initialized]);

    if (httpError) {
        return (
            <div className="container m-5">
                <p>{httpError}</p>
            </div>
        );
    }

    return (
        <div className="d-flex flex-column">
            <EventSearchAndFilter onShowEvents={onShowEvents}/>
            <div className="container-fluid flex-grow-1">
                <div className="row">
                    <div className="col-12 col-md-6 p-0">
                        <MapComponent events={eventsMap}/>
                    </div>
                    <div className="col-12 col-md-6 p-3 event-list" id="scrollable-event-list">
                        <InfiniteScroll
                            dataLength={events.length}
                            next={() => fetchEvents(selectedCity)} // Fetch events for the selected city
                            hasMore={hasMore}
                            loader={<p>Loading more events...</p>}
                            scrollableTarget="scrollable-event-list">
                            {events.map(event => (
                                <EventCard event={event} key={event.id}/> // Make sure the event.id is unique
                            ))}
                        </InfiniteScroll>
                    </div>
                </div>
            </div>
        </div>
    );
};
