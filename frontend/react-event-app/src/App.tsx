import React from 'react';
import './App.css';
import {Navbar} from "./layouts/NavbarAndFooter/Navbar";
import {SearchEvent} from "./layouts/HomePage/SearchEvent";
import 'leaflet/dist/leaflet.css';

function App() {
    return (
        <div >
            <Navbar/>
            <SearchEvent/>
        </div>
    );
}

export default App;
