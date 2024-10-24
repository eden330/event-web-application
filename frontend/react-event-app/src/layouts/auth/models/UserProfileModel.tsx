import {UserInformationModel} from "./UserInformationModel";

export interface UserProfileModel {
    username: string;
    email: string;
    userInformationDto: UserInformationModel | null;
}