import React from 'react';
import {MapContainer, TileLayer} from "react-leaflet";
import {MarkerCluster} from "../../HomePage/components/map/MarkerCluster";
import {EventModelMap} from "../../HomePage/models/map/EventModelMap";
import './../css/EventPage.css';

interface MapComponentProps {
    events: EventModelMap[];
    cityCoordinates?: { lat: number; lon: number } | null | undefined;
}

export const EventPageMap: React.FC<MapComponentProps> = ({events, cityCoordinates}) => {
    const middleOfPoland = [52, 19.4803];

    return (
        <MapContainer
            center={cityCoordinates ? [cityCoordinates.lat, cityCoordinates.lon] :
                [middleOfPoland[0], middleOfPoland[1]]}
            zoom={11}
            scrollWheelZoom={true}
            zoomControl={false}
            minZoom={5}
            boxZoom={false}
            className={"map-custom-height"}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">
                OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MarkerCluster events={events}/>
        </MapContainer>
    );
};
