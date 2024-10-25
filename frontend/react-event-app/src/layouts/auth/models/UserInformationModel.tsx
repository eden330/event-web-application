import {CityModel} from "../../HomePage/models/CityModel";
import {CategoryModel} from "../../HomePage/models/CategoryModel";

export interface UserInformationModel {
    city: CityModel | null;
    categories: CategoryModel[]
}