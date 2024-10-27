import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CategoryModel } from "../../layouts/HomePage/models/CategoryModel";
import { fetchCategories } from "../../api/eventApi";
import { RootState } from "../../store";

interface CategoriesState {
    categories: CategoryModel[];
    lastFetched: number | null;
    loading: boolean;
    error: string | null;
}

const initialState: CategoriesState = {
    categories: [],
    lastFetched: null,
    loading: false,
    error: null,
};

export const fetchCategoriesData = createAsyncThunk(
    'categories/fetchCategories',
    async (_, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const ONE_DAY = 24 * 60 * 60 * 1000;

        if (state.categories.lastFetched && Date.now() - state.categories.lastFetched < ONE_DAY) {
            console.log("Categories stored in cache")
            return;
        }

        try {
            const categoriesData = await fetchCategories();
            return { categories: categoriesData, lastFetched: Date.now() };
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const categoriesSlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategoriesData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategoriesData.fulfilled, (state, action: PayloadAction<{ categories: CategoryModel[]; lastFetched: number } | undefined>) => {
                state.loading = false;
                if (action.payload) {
                    state.categories = action.payload.categories;
                    state.lastFetched = action.payload.lastFetched;
                }
            })
            .addCase(fetchCategoriesData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to fetch categories";
            });
    },
});

export default categoriesSlice.reducer;
