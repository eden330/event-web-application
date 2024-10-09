import {LocationModel} from "./LocationModel";

export interface EventModel {
    id: number;
    name: string;
    description: string;
    image: string;
    startDate: string;
    endDate: string;
    location: LocationModel;
    category: string;
}