import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {EventModel} from "../../layouts/HomePage/models/EventModel";
import {CityModel} from "../../layouts/HomePage/models/CityModel";
import {CategoryModel} from "../../layouts/HomePage/models/CategoryModel";
import {fetchEventsMap} from "../../api/eventApi";
import {RootState} from "../../store";
import {EventModelMap} from "../../layouts/HomePage/models/map/EventModelMap";

interface EventsByFilters {
    events: EventModel[] | EventModelMap[];
    lastFetched: number;
}

interface EventsState {
    eventsByFilters: { [key: string]: EventsByFilters };
    cities: CityModel[];
    categories: CategoryModel[];
    lastFetchedCities: number | null;
    lastFetchedCategories: number | null;
    loading: boolean;
    error: string | null;
}

const initialState: EventsState = {
    eventsByFilters: {},
    cities: [],
    categories: [],
    lastFetchedCities: null,
    lastFetchedCategories: null,
    loading: false,
    error: null,
};

interface FetchEventsForMapArgs {
    cityName?: string;
    categories?: string[];
    searchTerm?: string;
}

interface FetchEventsForMapResponse {
    cached?: boolean;
    cacheKey: string;
    events?: EventModelMap[];
    lastFetched?: number;
}

const generateCacheKey = (cityName?: string, categories?: string[], searchTerm?: string): string => {
    const categoriesKey = categories ? categories.join(',') : 'all';
    return `${cityName || 'all'}-${categoriesKey}-${searchTerm || ''}-map`;
};

export const fetchFilteredEventsForMap = createAsyncThunk<FetchEventsForMapResponse, FetchEventsForMapArgs>(
    'data/fetchFilteredEventsForMap',
    async ({ cityName, categories, searchTerm }: FetchEventsForMapArgs, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const CACHE_DURATION = 30 * 60 * 1000;
        const cacheKey = generateCacheKey(cityName, categories, searchTerm);

        console.log("Generated cache key:", cacheKey);

        if (state.eventsData.eventsByFilters[cacheKey] && Date.now() - state.eventsData.eventsByFilters[cacheKey].lastFetched < CACHE_DURATION) {
            console.log("EVENTS FOR MAP IN CACHE -> NOT FETCHING", state.eventsData.eventsByFilters[cacheKey]);
            return { cached: true, cacheKey };
        }

        try {
            console.log("EVENTS FOR MAP NOT IN CACHE -> FETCHING");
            const eventsData = await fetchEventsMap(cityName, categories, searchTerm);
            return { events: eventsData, cacheKey, lastFetched: Date.now() };
        } catch (error: any) {
            console.error("Error fetching events for map:", error.message);
            return rejectWithValue(error.message);
        }
    }
);

const dataSlice = createSlice({
    name: 'data',
    initialState,
    reducers: {
        clearCache: (state) => {
            state.eventsByFilters = {};
            state.cities = [];
            state.categories = [];
            state.lastFetchedCities = null;
            state.lastFetchedCategories = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchFilteredEventsForMap.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                fetchFilteredEventsForMap.fulfilled,
                (
                    state,
                    action: PayloadAction<FetchEventsForMapResponse | undefined>
                ) => {
                    state.loading = false;
                    if (action.payload && action.payload.cacheKey && action.payload.events && action.payload.lastFetched) {
                        if (!action.payload.cached) {
                            const { cacheKey, events, lastFetched } = action.payload;
                            state.eventsByFilters[cacheKey] = { events, lastFetched };
                        }
                    }
                }
            )
            .addCase(fetchFilteredEventsForMap.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearCache } = dataSlice.actions;
export default dataSlice.reducer;
