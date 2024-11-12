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
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {Navigate, Route, Routes} from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import {ToastContainer} from "react-toastify";
import {FavouriteEvents} from "./layouts/auth/FavouriteEvents";
import RecommendedEvents from "./layouts/auth/RecommendedEvents";

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
                <Route path="/favourites" element={<FavouriteEvents/>}/>
                <Route path="/recommended" element={<RecommendedEvents/>}/>
            </Routes>
            <ToastContainer/>
        </div>
    );
}

export default App;
