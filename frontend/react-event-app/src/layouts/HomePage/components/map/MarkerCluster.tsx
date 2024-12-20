import React, {useEffect} from 'react';
import {useNavigate} from 'react-router-dom'; // Import useNavigate
import {useMap} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import {EventModelMap} from "../../models/map/EventModelMap";
import './MapComponents.css';
import {CategoryModel} from "../../models/CategoryModel";

interface MapComponentProps {
    events: EventModelMap[];
}

const createPopupContent = (event: EventModelMap): string => {
    return `
        <div class="popup-content" data-event-id="${event.id}" data-event-name="${encodeURIComponent(event.name)}" style="cursor: pointer;">
            <div class="card" style="border: 1px solid #ccc; border-radius: 8px; padding: 10px; width: 15rem; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                <div class="d-flex align-items-center">
                    <img src="${event.image}" class="img-fluid" alt="${event.name}" style="width: 50px; height: 50px; margin-right: 10px;" />
                    <div style="flex-grow: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        <h5 class="card-title" style="font-size: 0.9rem; font-weight: bold; margin: 0;">${event.name}</h5>
                        <p class="card-text" style="margin: 0;">${event.category.eventCategory}</p>
                    </div>
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

const getIconForCategory = (category: CategoryModel): string => {
    return category.image && category.image.trim() !== ''
        ? category.image
        : 'https://unpkg.com/leaflet@1.5.1/dist/images/marker-icon.png';
};

const getMostFrequentCategory = (events: EventModelMap[]): CategoryModel | null => {
    const categoryCounts: { [key: string]: { count: number, categoryModel: CategoryModel } } = {};

    events.forEach(event => {
        const categoryModel = event.category;
        const category = categoryModel.eventCategory;
        if (categoryCounts[category]) {
            categoryCounts[category].count += 1;
        } else {
            categoryCounts[category] = {count: 1, categoryModel};
        }
    });

    if (Object.keys(categoryCounts).length === 0) {
        return null;
    }

    return Object.values(categoryCounts).reduce((a, b) => a.count > b.count ? a : b).categoryModel;
};

const createClusterIcon = (cluster: any, events: EventModelMap[]): L.DivIcon => {
    const markers = cluster.getAllChildMarkers();
    const clusterEvents: EventModelMap[] = markers.map((marker: any) => {
        const popup = marker.getPopup();
        return events.find(event => popup && popup.getContent().includes(event.name));
    }).filter(Boolean);

    const mostFrequentCategory = getMostFrequentCategory(clusterEvents);
    const eventCount = markers.length;

    return L.divIcon({
        className: 'custom-cluster-icon',
        html: `
        <div class="marker-icon" style="background-image: url('${mostFrequentCategory?.image}');">
            <div class="event-count">${eventCount}</div>
        </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
    });
};

export const MarkerCluster: React.FC<MapComponentProps> = ({events}) => {
    const map = useMap();
    const navigate = useNavigate();

    useEffect(() => {
        const markerClusters = L.markerClusterGroup({
            zoomToBoundsOnClick: false,
            showCoverageOnHover: false,
            maxClusterRadius: 100,
            spiderfyOnMaxZoom: false,
            chunkedLoading: true,
            iconCreateFunction: (cluster) => createClusterIcon(cluster, events),
        });

        markerClusters.clearLayers();

        events.forEach((event) => {
            const popupContent = createPopupContent(event);

            const eventIcon = L.divIcon({
                className: 'custom-marker',
                html: `<div class="marker-icon" style="background-image: url('${getIconForCategory(event.category)}');"></div>`,
                iconSize: [30, 30],
                iconAnchor: [10, 10],
            });

            const marker = L.marker(new L.LatLng(event.location.latitude, event.location.longitude), {
                icon: eventIcon,
            });

            marker.bindPopup(popupContent);
            marker.on("popupopen", () => {
                // Attach click event on popup content to navigate
                document.querySelector('.popup-content')?.addEventListener('click', () => {
                    navigate(`/event/${event.id}/${encodeURIComponent(event.name)}`);
                });
            });
            markerClusters.addLayer(marker);
        });

        markerClusters.on('clusterclick', (e: any) => {
            const markers = e.layer.getAllChildMarkers();
            const clusterEvents = markers.map((marker: any) => {
                const popup = marker.getPopup();
                return events.find(event => popup.getContent().includes(event.name));
            }).filter(Boolean);

            if (clusterEvents.length > 0) {
                const clusterPopupContent = createClusterPopupContent(clusterEvents as EventModelMap[]);
                const popup = L.popup()
                    .setLatLng(e.latlng)
                    .setContent(clusterPopupContent)
                    .openOn(map);

                setTimeout(() => {
                    document.querySelectorAll('.popup-content').forEach(item => {
                        item.addEventListener('click', (ev) => {
                            const target = ev.currentTarget as HTMLElement;
                            const eventId = target.getAttribute('data-event-id');
                            const eventName = target.getAttribute('data-event-name');
                            if (eventId && eventName) {
                                navigate(`/event/${eventId}/${eventName}`);
                            }
                        });
                    });
                }, 0);
            }
        });

        map.addLayer(markerClusters);

        return () => {
            map.removeLayer(markerClusters);
        };

    }, [events, map, navigate]);

    return null;
};
