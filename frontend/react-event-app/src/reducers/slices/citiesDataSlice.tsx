import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {CityModel} from "../../layouts/HomePage/models/CityModel";
import {fetchCities} from "../../api/eventApi";
import {RootState} from "../../store";

interface CitiesState {
    cities: CityModel[];
    lastFetched: number | null;
    loading: boolean;
    error: string | null;
}

const initialState: CitiesState = {
    cities: [],
    lastFetched: null,
    loading: false,
    error: null,
};

export const fetchCitiesData = createAsyncThunk(
    'cities/fetchCities',
    async (_, {getState, rejectWithValue}) => {
        const state = getState() as RootState;
        const CACHE_DURATION = 30 * 60 * 1000;

        if (state.cities.lastFetched && Date.now() - state.cities.lastFetched < CACHE_DURATION) {
            console.log("Cities data is cached and still fresh");
            return;
        }

        try {
            const citiesData = await fetchCities();
            return {cities: citiesData, lastFetched: Date.now()};
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const citiesSlice = createSlice({
    name: 'cities',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCitiesData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCitiesData.fulfilled, (state, action: PayloadAction<{
                cities: CityModel[];
                lastFetched: number
            } | undefined>) => {
                state.loading = false;
                if (action.payload) {
                    state.cities = action.payload.cities;
                    state.lastFetched = action.payload.lastFetched;
                }
            })
            .addCase(fetchCitiesData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to fetch cities";
            });
    },
});

export default citiesSlice.reducer;