import { SET_MESSAGE, CLEAR_MESSAGE } from "../actions/types";

interface MessageState {
    message: string;
}

const initialState: MessageState = {
    message: "",
};

export default function messageReducer(state = initialState, action: any): MessageState {
    const { type, payload } = action;

    switch (type) {
        case SET_MESSAGE:
            return { message: payload };

        case CLEAR_MESSAGE:
            return { message: "" };

        default:
            return state;
    }
}
