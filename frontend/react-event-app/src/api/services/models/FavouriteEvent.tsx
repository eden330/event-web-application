import {CategoryModel} from "../../../layouts/HomePage/models/CategoryModel";

export interface FavouriteEventModel {
    id: number;
    name: string;
    image: string;
    category: CategoryModel;
}