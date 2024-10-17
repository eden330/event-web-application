import React, {useEffect} from 'react';
import {MapContainer, Marker, Popup, TileLayer, useMap} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../../css/HomePage.css';
import {EventModelMap} from "../../models/map/EventModelMap";
import {MarkerCluster} from "./MarkerCluster";

interface MapComponentProps {
    events: EventModelMap[];
    cityCoordinates?: { lat: number; lon: number } | null | undefined;
}

const SetMapCenter = ({ cityCoordinates }: { cityCoordinates?: { lat: number; lon: number } | null }) => {
    const map = useMap();

    useEffect(() => {
        if (cityCoordinates) {
            map.setView([cityCoordinates.lat, cityCoordinates.lon], 11);
        } else {
            map.setView([52, 19.4803], 6);
        }
    }, [cityCoordinates, map]);

    return null;
};

export const MapComponent: React.FC<MapComponentProps> = ({events, cityCoordinates}) => {
    const middleOfPoland = [52, 19.4803];

    return (
        <MapContainer
            center={cityCoordinates ? [cityCoordinates.lat, cityCoordinates.lon] :
                [middleOfPoland[0], middleOfPoland[1]]}
            zoom={cityCoordinates ? 11 : 6}
            scrollWheelZoom={true}
            zoomControl={false}
            minZoom={5}
            boxZoom={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MarkerCluster events={events}/>
            <SetMapCenter cityCoordinates={cityCoordinates} />
        </MapContainer>
    );
};
