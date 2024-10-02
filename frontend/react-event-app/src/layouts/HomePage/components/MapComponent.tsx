import React from 'react';
import {MapContainer, Marker, Popup, TileLayer} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../css/SearchEvent.css';

export const MapComponent: React.FC = () => {

    const middleOfPoland = [52, 19.4803]

    return (
        <MapContainer center={[middleOfPoland[0], middleOfPoland[1]]}
                      zoom={6} scrollWheelZoom={true} zoomControl={false} className={"leaflet-container"}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"


            />
        </MapContainer>
    )
};
