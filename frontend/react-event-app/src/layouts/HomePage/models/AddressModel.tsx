import {CityModel} from "./CityModel";

export interface AddressModel {
    id: number;
    street: string;
    city : CityModel;
}