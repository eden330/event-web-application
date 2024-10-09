import {AddressModel} from "./AddressModel";

export interface LocationModel {
    id: number;
    name: string;
    address: AddressModel;
}