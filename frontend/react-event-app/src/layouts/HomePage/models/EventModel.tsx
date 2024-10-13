import {LocationModel} from "./LocationModel";
import {CategoryModel} from "./CategoryModel";

export interface EventModel {
    id: number;
    name: string;
    description: string;
    image: string;
    startDate: string;
    endDate: string;
    location: LocationModel;
    category: CategoryModel;
}