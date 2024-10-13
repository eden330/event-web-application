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
    const numberOfEventsToFetch: number = 10;
    const [cityCoordinates, setCityCoordinates] = useState<{ lat: number; lon: number } | null>(null);
    const [size] = useState(numberOfEventsToFetch);
    const [hasMore, setHasMore] = useState(true);
    // const [totalEventsCount, setTotalEventsCount] = useState(0);
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [noResultsFound, setNoResultsFound] = useState(false);

    const fetchEvents = async (cityName: string | null = null, category: string | null = null) => {
        console.log("Fetching events for city: ", cityName, "and category:", category);
        if (!hasMore) return;

        try {
            const responseJson: EventModel[] = await fetchEventsList(page, size, cityName || undefined, category || undefined);

            console.log("Number of events returned:", responseJson.length);

            if (responseJson.length === 0) {
                setNoResultsFound(true);
                setHasMore(false);
            } else {
                setEvents((prevEvents) => [...prevEvents, ...responseJson]);
                setHasMore(responseJson.length === size);
                setPage(prevPage => prevPage + 1);
                setNoResultsFound(false);
            }
        } catch (error: any) {
            setHttpError(error.message);
        }
    };

    const fetchEventsForMap = async (cityName: string | null = null, category: string | null = null) => {
        try {
            const responseJson: EventModelMap[] = await fetchEventsMap(cityName || undefined, category || undefined);
            console.log("Number of events [MAP] returned:", responseJson.length);
            setEventsMap(responseJson);

        } catch (error: any) {
            setHttpError(error.message);
        }
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
    }

    const fetchInitialEvents = async () => {
        console.log("Fetching initial events without filters");
        setPage(0);
        setHasMore(true);
        setEvents([]);
        setCityCoordinates(null);

        await fetchEvents();
        await fetchEventsForMap();
    };

    const onShowEvents = (cityName: string | null, category: string | null) => {
        console.log("City and category selected: ", cityName, category);

        setHasMore(true);
        setPage(0);
        setEvents([]);

        setSelectedCity(cityName);
        setSelectedCategory(category);

        if (cityName === null) {
            setCityCoordinates(null);
        } else {
            fetchCityCoordinates(cityName);
        }
    };

    useEffect(() => {
        fetchInitialEvents();
    }, []);

    useEffect(() => {
        if (selectedCity || selectedCategory) {
            fetchEvents(selectedCity, selectedCategory);
            fetchEventsForMap(selectedCity, selectedCategory);
        } else {
            fetchInitialEvents();
        }
    }, [selectedCity, selectedCategory]);

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
                        {noResultsFound ? (
                            <p>No results found :D</p>
                        ) : (
                            <InfiniteScroll
                                dataLength={events.length}
                                next={() => fetchEvents(selectedCity)}
                                hasMore={hasMore}
                                loader={<p>Loading more events...</p>}
                                scrollableTarget="scrollable-event-list"
                            >
                                {events.map(event => (
                                    <EventCard event={event} key={event.id}/>
                                ))}
                            </InfiniteScroll>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
