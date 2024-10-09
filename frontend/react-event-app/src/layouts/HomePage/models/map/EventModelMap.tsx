import {LocationModelMap} from "./LocationModelMap";

export interface EventModelMap {
    id: number;
    name: string;
    description: string;
    image: string;
    startDate: string;
    endDate: string;
    location: LocationModelMap;
    category: string;
}