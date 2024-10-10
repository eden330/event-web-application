import React, {useEffect} from 'react';
import {MapContainer, TileLayer, useMap} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import {EventModelMap} from "../../models/map/EventModelMap";
import './MapComponents.css';

interface MapComponentProps {
    events: EventModelMap[];
}

const customIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.5.1/dist/images/marker-icon.png",
    iconSize: [25, 41]
});

const createPopupContent = (event: EventModelMap): string => {
    return `
        <div class="card" style="border: 1px solid #ccc; border-radius: 8px; padding: 10px; width: 15rem; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            <div class="d-flex align-items-center">
                <img src="${event.image}" class="img-fluid" alt="${event.name}" style="width: 50px; height: 50px; margin-right: 10px;" />
                <div style="flex-grow: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    <h5 class="card-title" style="font-size: 0.9rem; font-weight: bold; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${event.name}</h5>
                    <p class="card-text" style="margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${event.category.eventCategory}</p>
                </div>
            </div>
        </div>
    `;
};

const createClusterPopupContent = (events: EventModelMap[]): string => {
    return `
        <div style="max-height: 200px; overflow-y: auto;">
            <h5>Events in this area:</h5>
            <ul style="list-style: none; padding: 0;">
                ${events.map(event => `
                    <li style="margin-bottom: 10px;">
                        ${createPopupContent(event)}
                    </li>`).join('')}
            </ul>
        </div>
    `;
};

const getIconForCategory = (category: string): string => {

    switch (category.toLowerCase()) {
        case 'art':
            return '/images/SearchEventImages/art-work.png';
        case 'festival':
            return '/images/SearchEventImages/festival.png';
        case 'sport':
            return '/images/SearchEventImages/sport-icon.png';
        case 'theater':
            return '/images/SearchEventImages/theater-masks.png';
        default:
            return 'https://unpkg.com/leaflet@1.5.1/dist/images/marker-icon.png'; // default icon
    }
};

const getMostFrequentCategory = (events: EventModelMap[]): string => {
    const categoryCounts: { [key: string]: number } = {};

    events.forEach(event => {
        const category = event.category.eventCategory;
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    return Object.keys(categoryCounts).reduce((a, b) => categoryCounts[a] > categoryCounts[b] ? a : b);
};

const createClusterIcon = (cluster: any, events: EventModelMap[]): L.DivIcon => {
    const markers = cluster.getAllChildMarkers();
    const clusterEvents: EventModelMap[] = markers.map((marker: any) => {
        const popup = marker.getPopup();
        return events.find(event => popup && popup.getContent().includes(event.name));
    }).filter(Boolean); // Ensure there are no undefined values

    const mostFrequentCategory = getMostFrequentCategory(clusterEvents);
    const eventCount = markers.length;

    return L.divIcon({
        className: 'custom-cluster-icon',
        html: `
            <div class="marker-icon" style="background-image: url('${getIconForCategory(mostFrequentCategory)}');">
                <div class="event-count">${eventCount}</div>
            </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
    });
};

export const MarkerCluster: React.FC<MapComponentProps> = ({events}) => {
    const map = useMap();


    useEffect(() => {
        const markerClusters = L.markerClusterGroup({
            zoomToBoundsOnClick: false,
            showCoverageOnHover: false,
            maxClusterRadius: 100,
            spiderfyOnMaxZoom: false,
            chunkedLoading: true,
            iconCreateFunction: (cluster) => createClusterIcon(cluster, events)

        });

        markerClusters.clearLayers();

        events.forEach((event) => {
            const popupContent = createPopupContent(event);

            const eventIcon = L.divIcon({
                className: 'custom-marker',
                html: `<div class="marker-icon" style="background-image: url('${getIconForCategory(event.category.eventCategory)}');"></div>`,
                iconSize: [30, 30],
                iconAnchor: [10, 10],
            });

            L.marker(new L.LatLng(event.location.latitude, event.location.longitude), {
                icon: eventIcon,
            }).bindPopup(popupContent)
                .addTo(markerClusters);

        });


        markerClusters.on('clusterclick', (e: any) => {
            const markers = e.layer.getAllChildMarkers();
            const clusterEvents = markers.map((marker: any) => {
                const popup = marker.getPopup();
                const eventData = events.find(event => popup.getContent().includes(event.name));
                return eventData;
            }).filter(Boolean);

            if (clusterEvents.length > 0) {
                const clusterPopupContent = createClusterPopupContent(clusterEvents as EventModelMap[]);
                const popup = L.popup()
                    .setLatLng(e.latlng)
                    .setContent(clusterPopupContent)
                    .openOn(map);
            }
        });

        map.addLayer(markerClusters);

        return () => {
            map.removeLayer(markerClusters);
        };

    }, [events, map]);

    return null;
};
