import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/authReducer";
import messageReducer from "./reducers/messageReducer";

const store = configureStore({
    reducer: {
        auth: authReducer,
        message: messageReducer,
    },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
