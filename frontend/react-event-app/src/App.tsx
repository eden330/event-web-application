import React from 'react';
import './App.css';
import {Navbar} from "./layouts/Navbar/Navbar";
import {HomePage} from "./layouts/HomePage/HomePage";
import {EventPage} from "./layouts/EventPage/EventPage";
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Route, Routes, Navigate} from "react-router-dom";

function App() {
    return (
        <div>
            <Navbar/>
            <Routes>
                <Route path="/" element={<Navigate to="/home"/>}/>
                <Route path="/home" element={<HomePage/>}/>
                <Route path="/event/:eventId/:eventName" element={<EventPage/>} />
            </Routes>
        </div>
    );
}

export default App;
