import React, {useEffect, useRef, useState} from 'react';
import './css/HomePage.css';
import {EventSearchAndFilter} from "./components/EventSearchAndFilter";
import {MapComponent} from "./components/map/MapComponent";
import {EventCard} from "./components/EventCard";
import {EventModel} from "./models/EventModel";
import {EventModelMap} from "./models/map/EventModelMap";
import InfiniteScroll from "react-infinite-scroll-component";
import {fetchCity, fetchEventsList} from "../../api/eventApi";
import {fetchFilteredEventsForMap} from '../../reducers/slices/eventsDataSlice';
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../store";

export const HomePage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const {eventsByFilters} = useSelector((state: RootState) => state.eventsData);

    const [events, setEvents] = useState<EventModel[]>([]);
    const [eventsMap, setEventsMap] = useState<EventModelMap[]>([]);
    const [httpError, setHttpError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const numberOfEventsToFetch = 10;
    const [cityCoordinates, setCityCoordinates] = useState<{ lat: number; lon: number } | null>(null);
    const [size] = useState<number>(numberOfEventsToFetch);
    const [hasMore, setHasMore] = useState(true);
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState<string | null>(null);
    const [noResultsFound, setNoResultsFound] = useState(false);
    const isFetching = useRef(false);

    const [swipedEventId, setSwipedEventId] = useState<number | null>(null);

    const fetchEvents = async (
        cityName: string | null = null,
        categories: string[] = [],
        searchTerm: string | null = null,
        reset: boolean = false
    ) => {
        if (isFetching.current || (!hasMore && !reset)) return;

        isFetching.current = true;

        try {
            if (reset) {
                setPage(0);
                setHasMore(true);
                setEvents([]);
            }

            const currentPage = reset ? 0 : page;
            const responseJson = await fetchEventsList(
                currentPage,
                size,
                cityName || undefined,
                categories.length > 0 ? categories : undefined,
                searchTerm || undefined
            ) as EventModel[];

            if (responseJson.length === 0) {
                if (events.length > 0) {
                    return;
                }
                setNoResultsFound(true);
                setHasMore(false);
                if (reset) setEvents([]);
            } else {
                setEvents((prevEvents) => reset ? responseJson : [...prevEvents, ...responseJson]);
                setHasMore(responseJson.length === size);
                setPage((prevPage) => prevPage + 1);
                setNoResultsFound(false);
            }
        } catch (error: any) {
            setHttpError(error.message || "An unknown error occurred.");
        } finally {
            isFetching.current = false;
        }
    };

    const fetchEventsForMap = async () => {
        try {
            const actionResult = await dispatch(fetchFilteredEventsForMap({
                cityName: selectedCity ?? undefined,
                categories: selectedCategories,
                searchTerm: searchTerm ?? undefined,
            }));

            if (fetchFilteredEventsForMap.fulfilled.match(actionResult)) {
                const {cacheKey, events, cached} = actionResult.payload || {};

                if (cached) {
                    const cachedEvents = eventsByFilters[cacheKey]?.events || [];
                    setEventsMap(cachedEvents);
                } else {
                    setEventsMap(events || []);
                }
            }
        } catch (err: any) {
            setHttpError(err.message || "An error occurred while fetching map events.");
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
            setHttpError(error.message || "Error fetching city coordinates.");
        }
    };

    const fetchInitialEvents = async () => {
        setPage(0);
        setHasMore(true);
        setEvents([]);
        setCityCoordinates(null);

        await fetchEvents();
        await fetchEventsForMap();
    };

    const onShowEvents = (cityName: string | null = null, categories: string[] = [], searchTerm: string | null = null, selectedEvent?: EventModel) => {
        if (selectedEvent) {
            setEvents([selectedEvent]);
            setEventsMap([selectedEvent]);
            setHasMore(false);
            fetchCityCoordinates(selectedEvent.location.address.city.name);
        } else {
            setHasMore(true);
            setPage(0);
            setEvents([]);
            setSelectedCategories(categories);
            setSearchTerm(searchTerm);
            setSelectedCity(cityName);
            if (cityName) {
                fetchCityCoordinates(cityName);
            }
        }
    };

    const clearFilters = () => {
        setSelectedCity(null);
        setSelectedCategories([]);
        setSearchTerm(null);
        setHasMore(true);
        setPage(0);
        setEvents([]);
        setCityCoordinates({lat: 52, lon: 19.4803});
        setSwipedEventId(null);
    };

    useEffect(() => {
        if (selectedCity || selectedCategories.length > 0 || searchTerm) {
            fetchEvents(selectedCity, selectedCategories, searchTerm, true);
            fetchEventsForMap();
        } else {
            fetchInitialEvents();
        }
    }, [selectedCity, selectedCategories, searchTerm]);

    const handleSwipeLeft = (event: EventModel) => {
        if (swipedEventId !== event.id) {
            console.log("Showing only this event on map:", event);
            setEventsMap([event]);
            setCityCoordinates({
                lat: event.location.address.city.latitude,
                lon: event.location.address.city.longitude
            });
            setSwipedEventId(event.id);
        }
    };

    if (httpError) {
        return (
            <div className="container m-5">
                <p>{httpError}</p>
            </div>
        );
    }

    return (
        <div className="container-fluid" style={{overflowY: "auto", height: "100vh"}}>
            <div className="search-filter-section bg-light shadow-sm rounded mb-3">
                <EventSearchAndFilter onShowEvents={onShowEvents} clearFilters={clearFilters} />
            </div>
            <div className="d-flex flex-column">
                <div className="container-fluid flex-grow-1">
                    <div className="row">
                        <div className="col-12 col-md-5 p-3">
                            <div className="map-tab">
                                <div className="event-count-overlay">
                                    <span className="event-count-text">{eventsMap.length}</span>
                                    <span className="event-count-label">Events</span>
                                </div>
                            </div>
                            <div className="map-container">
                                <MapComponent events={eventsMap} cityCoordinates={cityCoordinates} />
                            </div>
                        </div>
                        <div className="col-12 col-md-7 p-3 event-list-container" id="scrollable-event-list">
                            <div className="d-flex justify-content-center align-items-center">
                                <button
                                    className="clear-filters"
                                    onClick={clearFilters}
                                >
                                    CLEAR FILTERS
                                </button>
                            </div>
                            {noResultsFound ? (
                                <p className="text-muted">No results found 😕</p>
                            ) : (
                                <InfiniteScroll
                                    dataLength={events.length}
                                    next={() => fetchEvents(selectedCity, selectedCategories, searchTerm)}
                                    hasMore={hasMore}
                                    loader={<p></p>}
                                    scrollableTarget="scrollable-event-list"
                                >
                                    {events.map((event) => (
                                        <EventCard key={event.id} event={event} onSwipeLeft={handleSwipeLeft} />
                                    ))}
                                </InfiniteScroll>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
