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
            const isDefaultCenter = cityCoordinates.lat === 52 && cityCoordinates.lon === 19.4803;
            const zoomLevel = isDefaultCenter ? 6 : 11;

            map.flyTo([cityCoordinates.lat, cityCoordinates.lon], zoomLevel, {
                animate: true,
                duration: 1.2,
                easeLinearity: 0.1,
            });
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
