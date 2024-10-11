import React, {useEffect} from 'react';
import {MapContainer, Marker, Popup, TileLayer, useMap} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../../css/SearchEvent.css';
import {EventModelMap} from "../../models/map/EventModelMap";
import {MarkerCluster} from "./MarkerCluster";

interface MapComponentProps {
    events: EventModelMap[];
    cityCoordinates?: { lat: number; lon: number } | null;
}

const SetMapCenter = ({cityCoordinates}: { cityCoordinates: { lat: number; lon: number } }) => {
    const map = useMap();

    useEffect(() => {
        if (cityCoordinates) {
            map.setView([cityCoordinates.lat, cityCoordinates.lon], 11);
        }
    }, [cityCoordinates, map]);

    return null;
};

export const MapComponent: React.FC<MapComponentProps> = ({events, cityCoordinates}) => {
    const middleOfPoland = [52, 19.4803];

    return (
        <MapContainer
            center={[middleOfPoland[0], middleOfPoland[1]]}
            zoom={6}
            scrollWheelZoom={true}
            zoomControl={false}
            minZoom={5}
            boxZoom={false}
            className="leaflet-container">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright"
                >OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MarkerCluster events={events}/>
            {cityCoordinates && <SetMapCenter cityCoordinates={cityCoordinates}/>}
        </MapContainer>
    );
};
