import React from 'react';
import './App.css';
import {Navbar} from "./layouts/Navbar/Navbar";
import {HomePage} from "./layouts/HomePage/HomePage";
import {EventPage} from "./layouts/EventPage/EventPage";
import {Register} from "./layouts/auth/Register";
import {Profile} from "./layouts/auth/Profile";
import {Login} from "./layouts/auth/Login";
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Route, Routes, Navigate} from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import {ToastContainer} from "react-toastify";
import {FavouriteEvents} from "./layouts/auth/FavouriteEvents";

function App() {
    return (
        <div>
            <Navbar/>
            <Routes>
                <Route path="/" element={<Navigate to="/home"/>}/>
                <Route path="/home" element={<HomePage/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/profile" element={<Profile/>}/>
                <Route path="/event/:eventId/:eventName" element={<EventPage/>}/>
                <Route path="/favourites" element={<FavouriteEvents />} />
            </Routes>
            <ToastContainer />
        </div>
    );
}

export default App;
