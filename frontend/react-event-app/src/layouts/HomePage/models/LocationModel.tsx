import {AddressModel} from "./AddressModel";

export interface LocationModel {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    address: AddressModel;
}