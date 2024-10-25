export interface UpdateRequest {
    username: string;
    email: string;
    categoriesId: number[];
    cityId: number | null;
}