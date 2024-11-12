import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import store, {persistor} from './store';
import App from './App';
import {BrowserRouter} from "react-router-dom";
import {Provider} from 'react-redux';
import {PersistGate} from "redux-persist/integration/react";
import '@fortawesome/fontawesome-free/css/all.min.css';


const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <BrowserRouter>
                {/*<React.StrictMode>*/}
                <App/>
                {/* </React.StrictMode>*/}
            </BrowserRouter>
        </PersistGate>
    </Provider>
);

