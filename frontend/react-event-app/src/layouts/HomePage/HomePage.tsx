import React, { useState, useEffect, useRef } from 'react';
import './css/HomePage.css';
import { EventSearchAndFilter } from "./components/EventSearchAndFilter";
import { MapComponent } from "./components/map/MapComponent";
import { EventCard } from "./components/EventCard";
import { EventModel } from "./models/EventModel";
import { EventModelMap } from "./models/map/EventModelMap";
import InfiniteScroll from "react-infinite-scroll-component";
import { fetchCity, fetchEventsList } from "../../api/eventApi";
import { fetchFilteredEventsForMap } from '../../reducers/slices/eventsDataSlice';
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../store";

export const HomePage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { eventsByFilters } = useSelector((state: RootState) => state.eventsData);

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

    const fetchEvents = async (
        cityName: string | null = null,
        categories: string[] = [],
        searchTerm: string | null = null,
        reset: boolean = false
    ) => {
        console.log("Fetching events for city:", cityName, "categories:", categories, "filter:", searchTerm);
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

            console.log("Number of events returned:", responseJson.length);

            if (responseJson.length === 0) {
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
        console.log("Fetching map events for city:", selectedCity, "categories:", selectedCategories, "filter:", searchTerm);

        try {
            const actionResult = await dispatch(fetchFilteredEventsForMap({
                cityName: selectedCity ?? undefined,
                categories: selectedCategories,
                searchTerm: searchTerm ?? undefined,
            }));

            if (fetchFilteredEventsForMap.fulfilled.match(actionResult)) {
                const { cacheKey, events, cached } = actionResult.payload || {};
                console.log("Fetched events from map:", events, "with cache key:", cacheKey);

                if (cached) {
                    const cachedEvents = eventsByFilters[cacheKey]?.events || [];
                    console.log("Using cached events:", cachedEvents);
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
                setCityCoordinates({ lat: cityData.latitude, lon: cityData.longitude });
            } else {
                console.error(`No coordinates found for city: ${cityName}`);
            }
        } catch (error: any) {
            setHttpError(error.message || "Error fetching city coordinates.");
        }
    };

    const fetchInitialEvents = async () => {
        console.log("Fetching initial events without filters");
        setPage(0);
        setHasMore(true);
        setEvents([]);
        setCityCoordinates(null);

        await fetchEvents();
        await fetchEventsForMap();
    };

    const onShowEvents = (cityName: string | null = null, categories: string[] = [], searchTerm: string | null = null) => {
        setHasMore(true);
        setPage(0);
        setEvents([]);

        setSelectedCategories(categories);
        setSearchTerm(searchTerm);
        setSelectedCity(cityName);

        if (cityName) {
            fetchCityCoordinates(cityName);
        }
    };

    const clearFilters = () => {
        console.log("Clearing all filters");
        setSelectedCity(null);
        setSelectedCategories([]);
        setSearchTerm(null);

        setHasMore(true);
        setPage(0);
        setEvents([]);
    };

    useEffect(() => {
        if (selectedCity || selectedCategories.length > 0 || searchTerm) {
            fetchEvents(selectedCity, selectedCategories, searchTerm, true);
            fetchEventsForMap();
        } else {
            fetchInitialEvents();
        }
    }, [selectedCity, selectedCategories, searchTerm]);

    if (httpError) {
        return (
            <div className="container m-5">
                <p>{httpError}</p>
            </div>
        );
    }

    return (
        <div className="d-flex flex-column">
            <EventSearchAndFilter onShowEvents={onShowEvents} clearFilters={clearFilters} />
            <div className="container-fluid flex-grow-1">
                <div className="row">
                    <div className="col-12 col-md-6 p-0">
                        <MapComponent events={eventsMap} cityCoordinates={cityCoordinates} />
                    </div>
                    <div className="col-12 col-md-6 p-3 event-list" id="scrollable-event-list">
                        {noResultsFound ? (
                            <p>No results found :D</p>
                        ) : (
                            <InfiniteScroll
                                dataLength={events.length}
                                next={() => fetchEvents(selectedCity, selectedCategories, searchTerm)}
                                hasMore={hasMore}
                                loader={<p>Loading more events...</p>}
                                scrollableTarget="scrollable-event-list"
                            >
                                {events.map((event) => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                            </InfiniteScroll>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
