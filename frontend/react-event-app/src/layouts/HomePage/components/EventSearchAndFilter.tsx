import React, { useState, useEffect } from "react";
import { CategoryAndCityButton } from "./CategoryAndCityButton";
import { CitiesModal } from "./CitiesModal";
import { fetchCities } from "../../../api/eventApi";
import { CityModel } from "../models/CityModel";

// Define prop types for the component
interface EventSearchAndFilterProps {
    onShowEvents: (cityName: string | null) => void; // Prop for passing the selected city
}

export const EventSearchAndFilter: React.FC<EventSearchAndFilterProps> = ({ onShowEvents }) => {
    const [showModal, setShowModal] = useState(false);
    const [cities, setCities] = useState<CityModel[]>([]);
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

    useEffect(() => {
        if (showModal) {
            loadCities();
        }
    }, [showModal]);

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
                            <CategoryAndCityButton label="WWA" imgSource=""/>
                            <CategoryAndCityButton label="WRO" imgSource=""/>
                            <CategoryAndCityButton label="POZ" imgSource=""/>
                            <CategoryAndCityButton label="GDK" imgSource=""/>
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

            {/* Pass the onShowEvents function down to CitiesModal */}
            <CitiesModal
                show={showModal}
                handleClose={handleCloseModal}
                cities={cities}
                onShowEvents={onShowEvents} // Pass the prop here
            />
        </div>
    );
};
