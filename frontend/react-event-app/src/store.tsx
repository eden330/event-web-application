import {configureStore} from "@reduxjs/toolkit";
import {persistReducer, persistStore} from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./reducers/authReducer";
import messageReducer from "./reducers/messageReducer";
import categoriesReducer from "./reducers/slices/categoriesDataSlice";
import eventsDataReducer from "./reducers/slices/eventsDataSlice";
import citiesReducer from "./reducers/slices/citiesDataSlice";
import {combineReducers} from "redux";

const rootReducer = combineReducers({
    auth: authReducer,
    message: messageReducer,
    categories: categoriesReducer,
    cities: citiesReducer,
    eventsData: eventsDataReducer,
});

const persistConfig = {
    key: "root",
    storage,
    whitelist: ["categories", "cities", "eventsData"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export const persistor = persistStore(store);

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
