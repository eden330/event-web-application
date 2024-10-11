import React, { useState, useEffect } from "react";
import { CategoryAndCityButton } from "./CategoryAndCityButton";
import { CitiesModal } from "./CitiesModal";
import {fetchCategories, fetchCities} from "../../../api/eventApi";
import { CityModel } from "../models/CityModel";
import {CategoryModel} from "../models/CategoryModel";


interface EventSearchAndFilterProps {
    onShowEvents: (cityName: string | null) => void;
}

export const EventSearchAndFilter: React.FC<EventSearchAndFilterProps> = ({ onShowEvents }) => {
    const [showModal, setShowModal] = useState(false);
    const [cities, setCities] = useState<CityModel[]>([]);
    const [categories, setCategories] = useState<CategoryModel[]>([]);
    const [httpError, setHttpError] = useState<string | null>(null);

    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    const loadCities = async () => {
        if (showModal) {
            try {
                const responseJson: CityModel[] = await fetchCities();
                setCities(responseJson);
            } catch (error: any) {
                setHttpError(error.message);
            }
        }
    };

    const loadCategories = async () => {
        try {
            const responseJson: CategoryModel[] = await fetchCategories();
            setCategories(responseJson);
        } catch (error: any) {
            setHttpError(error.message);
        }
    };

    useEffect(() => {
        if (showModal) {
            loadCities();
        }
    }, [showModal]);

    useEffect(() => {
        loadCategories();  // Fetch categories when component is mounted
    }, []);

    if (httpError) {
        return (
            <div className="container m-5">
                <p>{httpError}</p>
            </div>
        );
    }

    return (
        <div>
            <div className="container-fluid">
                <div className="row justify-content-center">
                    <div className="col-lg-4 col-12">
                        <div className="col d-flex justify-content-center align-items-center">
                            <h6>EVENT CATEGORIES</h6>
                        </div>
                        <div className="row justify-content-center">
                            {categories.length > 0 ? (
                                categories.map(category => (
                                    <CategoryAndCityButton
                                        key={category.id}
                                        label={category.eventCategory}
                                        image={category.image} // Assuming you have an icon URL
                                    />
                                ))
                            ) : (
                                <p>Loading categories...</p>
                            )}
                        </div>
                    </div>

                    <div className="col-lg-4 col-12">
                        <div className="col d-flex justify-content-center align-items-center">
                            <h6>SEARCH EVENTS</h6>
                        </div>
                        <div className="d-flex">
                            <input
                                className="form-control me-2 mt-3"
                                type="search"
                                placeholder="Search events"
                                aria-label="Search"
                            />
                            <button className="btn btn-outline-success mt-3">Search</button>
                        </div>
                    </div>

                    <div className="col-lg-4 col-12">
                        <div className="col d-flex justify-content-center align-items-center">
                            <h6>EVENT CITIES</h6>
                        </div>
                        <div className="row justify-content-center">
                            <button
                                className="btn btn-outline-primary"
                                onClick={handleShowModal}
                                style={{width: '150px', padding: '5px 10px', textAlign: 'center'}}>
                                Show Cities
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <CitiesModal
                show={showModal}
                handleClose={handleCloseModal}
                cities={cities}
                onShowEvents={onShowEvents}
            />
        </div>
    );
};
