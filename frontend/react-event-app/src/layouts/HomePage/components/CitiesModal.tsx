import React, {useState} from 'react';
import {CityModel} from "../models/CityModel";

interface CitiesModalProps {
    show: boolean;
    handleClose: () => void;
    cities: CityModel[];
    onShowEvents: (cityName: string | null) => void;
}

export const CitiesModal: React.FC<CitiesModalProps> = ({show, handleClose, cities, onShowEvents}) => {
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false);

    const handleCityClick = (cityName: string) => {
        setSelectedCity(cityName);
        setIsDropdownVisible(false);
    };

    const handleClearFilters = () => {
        setSelectedCity(null);
        setSearchQuery('');
        setIsDropdownVisible(false);
    };

    const filteredCities = cities.filter(city =>
        city.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={`modal ${show ? 'show' : ''}`} style={{display: show ? "block" : "none"}}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Location</h5>
                        <button type="button" className="btn-close" onClick={handleClose}></button>
                    </div>
                    <div className="modal-body" style={{maxHeight: '400px', overflowY: 'auto'}}>
                        <div className="position-relative">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search cities..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setIsDropdownVisible(true);
                                }}
                            />
                            {isDropdownVisible && searchQuery && (
                                <ul className="dropdown-menu show w-100 position-absolute"
                                    style={{maxHeight: '150px', overflowY: 'auto'}}>
                                    {filteredCities.length > 0 ? (
                                        filteredCities.map((city, index) => (
                                            <li
                                                key={index}
                                                className="dropdown-item"
                                                onClick={() => handleCityClick(city.name)}
                                                style={{
                                                    cursor: 'pointer',
                                                    backgroundColor: selectedCity === city.name ? '#cce5ff' : 'transparent'
                                                }}
                                            >
                                                {city.name}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="dropdown-item">No cities found.</li>
                                    )}
                                </ul>
                            )}
                        </div>

                        <div className="location-section mt-3">
                            <h6>All Cities</h6>
                            <div className="location-tags">
                                {cities.map((city, index) => (
                                    <span
                                        className="tag"
                                        key={index}
                                        onClick={() => handleCityClick(city.name)}
                                        style={{
                                            cursor: 'pointer',
                                            backgroundColor: selectedCity === city.name ? '#cce5ff' : '#f1f1f1'
                                        }}
                                    >
                                        {city.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleClearFilters}
                        >
                            Clear filters
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => {
                                onShowEvents(selectedCity);
                                handleClose();
                            }}>
                            Show events
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
