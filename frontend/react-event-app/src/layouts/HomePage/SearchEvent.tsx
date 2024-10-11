import React, {useState, useEffect} from 'react';
import './css/SearchEvent.css';
import {EventSearchAndFilter} from "./components/EventSearchAndFilter";
import {MapComponent} from "./components/map/MapComponent";
import {EventCard} from "./components/EventCard";
import {EventModel} from "./models/EventModel";
import {EventModelMap} from "./models/map/EventModelMap";
import InfiniteScroll from "react-infinite-scroll-component";
import {fetchEventCount, fetchCity, fetchEventsMap, fetchEventsList} from "../../api/eventApi";

export const SearchEvent = () => {
    const [events, setEvents] = useState<EventModel[]>([]);
    const [eventsMap, setEventsMap] = useState<EventModelMap[]>([]);
    const [httpError, setHttpError] = useState(null);
    const [page, setPage] = useState(0);
    const numberOfEventsToFetch: number = 20;
    const [cityCoordinates, setCityCoordinates] = useState<{ lat: number; lon: number } | null>(null);
    const [size] = useState(numberOfEventsToFetch);
    const [hasMore, setHasMore] = useState(true);
    // const [totalEventsCount, setTotalEventsCount] = useState(0);
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [initialized, setInitialized] = useState(false);

    const fetchEvents = async (cityName: string | null = null) => {
        console.log("Fetching events for city: ", cityName);
        if (!hasMore) return;

        try {
            const responseJson: EventModel[] = await fetchEventsList(page, size, cityName || undefined);

            console.log("Number of events returned:", responseJson.length);

            setEvents((prevEvents) => [...prevEvents, ...responseJson]);

            if (responseJson.length === 0 || responseJson.length < size) {
                setHasMore(false);
            }

            setPage(prevPage => prevPage + 1);
        } catch (error: any) {
            setHttpError(error.message);
        }
    };

    const fetchEventsForMap = async () => {
        try {
            const responseJson: EventModelMap[] = await fetchEventsMap();
            setEventsMap(responseJson);
        } catch (error: any) {
            setHttpError(error.message);
        }
    };

    const fetchInitialEvents = async (cityName: string | null) => {
        console.log("Fetching initial events for city: ", cityName);
        setPage(0);
        setHasMore(true);
        setEvents([]);

        await fetchEvents(cityName);
    };

    const fetchCityCoordinates = async (cityName: string | null) => {
        if (!cityName) return;
        try {
            const cityData = await fetchCity(cityName);
            if (cityData && cityData.latitude && cityData.longitude) {
                setCityCoordinates({lat: cityData.latitude, lon: cityData.longitude});
            } else {
                console.error(`No coordinates found for city: ${cityName}`);
            }
        } catch (error: any) {
            setHttpError(error.message);
        }
    };

    const onShowEvents = (cityName: string | null) => {
        console.log("City selected in modal: ", cityName);
        setSelectedCity(cityName);
        setHasMore(true);
        setPage(0);
        fetchCityCoordinates(cityName);
    };

    useEffect(() => {
        const initialize = async () => {
            try {
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
                        <MapComponent events={eventsMap} cityCoordinates={cityCoordinates}/>
                    </div>
                    <div className="col-12 col-md-6 p-3 event-list" id="scrollable-event-list">
                        <InfiniteScroll
                            dataLength={events.length}
                            next={() => fetchEvents(selectedCity)}
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
