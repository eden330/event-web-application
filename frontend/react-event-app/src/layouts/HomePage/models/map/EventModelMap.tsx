import {LocationModelMap} from "./LocationModelMap";
import {CategoryModel} from "../CategoryModel";

export interface EventModelMap {
    id: number;
    name: string;
    description: string;
    image: string;
    startDate: string;
    endDate: string;
    location: LocationModelMap;
    category: CategoryModel;
}