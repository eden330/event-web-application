import React, {useEffect, useRef, useState} from "react";
import {CategoryButton} from "./CategoryButton";
import {CitiesModal} from "./CitiesModal";
import {fetchEventsList} from "../../../api/eventApi";
import {EventModel} from "../models/EventModel";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../../store";
import {fetchCategoriesData} from "../../../reducers/slices/categoriesDataSlice";
import {fetchCitiesData} from "../../../reducers/slices/citiesDataSlice";

interface EventSearchAndFilterProps {
    onShowEvents: (cityName: string | null, categories: string[], searchTerm?: string | null) => void;
    clearFilters: () => void;
}

export const EventSearchAndFilter: React.FC<EventSearchAndFilterProps> = ({ onShowEvents, clearFilters }) => {
    const dispatch = useDispatch<AppDispatch>();

    const [showModal, setShowModal] = useState(false);
    const [httpError, setHttpError] = useState<string | null>(null);
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [suggestions, setSuggestions] = useState<EventModel[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    const categories = useSelector((state: RootState) => state.categories.categories);
    const cities = useSelector((state: RootState) => state.cities.cities);

    const handleCategoryClick = (category: string) => {
        const updatedCategories = selectedCategories.includes(category) ? [] : [category];
        setSelectedCategories(updatedCategories);
        onShowEvents(selectedCity, updatedCategories, searchTerm);
    };

    const handleCitySelection = (city: string | null) => {
        if (city !== selectedCity) {
            setSelectedCity(city);
            onShowEvents(city, selectedCategories, searchTerm);
        } else {
            console.log("Same city selected, no event fetch triggered.");
        }
    };

    const fetchSuggestions = async (searchValue: string) => {
        if (searchValue.length >= 3) {
            try {
                const suggestionResponse: EventModel[] = await fetchEventsList(
                    0,
                    10,
                    selectedCity || undefined,
                    selectedCategories.length > 0 ? selectedCategories : undefined,
                    searchValue
                );
                setSuggestions(suggestionResponse);
                setShowDropdown(true);
            } catch (error) {
                console.error("Error fetching suggestions:", error);
                setSuggestions([]);
                setShowDropdown(false);
            }
        } else {
            setShowDropdown(false);
        }
    };

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = e.target.value;
        setSearchTerm(searchValue);

        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(() => {
            fetchSuggestions(searchValue);
        }, 400);
    };

    const handleSuggestionClick = (suggestion: EventModel) => {
        setSearchTerm(suggestion.name);
        setShowDropdown(false);
        onShowEvents(selectedCity, selectedCategories, suggestion.name);
    };

    const handleSearch = () => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        onShowEvents(selectedCity, selectedCategories, searchTerm);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const handleClearFilters = () => {
        if (!selectedCity && selectedCategories.length === 0 && !searchTerm) {
            console.log("Filters are already cleared, no action taken.");
            return;
        }

        setSelectedCity(null);
        setSelectedCategories([]);
        setSearchTerm("");
        setSuggestions([]);
        setShowDropdown(false);
        clearFilters();
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                searchInputRef.current &&
                !searchInputRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (showModal) {
            dispatch(fetchCitiesData());
        }
    }, [showModal, dispatch]);

    useEffect(() => {
        dispatch(fetchCategoriesData());
    }, [dispatch]);

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
                                categories.map((category) => (
                                    <CategoryButton
                                        key={category.id}
                                        label={category.eventCategory}
                                        image={category.image}
                                        onClick={() => handleCategoryClick(category.eventCategory)}
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
                        <div className="d-flex position-relative">
                            <input
                                ref={searchInputRef}
                                className="form-control me-2 mt-3"
                                type="search"
                                placeholder="Search events"
                                aria-label="Search"
                                value={searchTerm}
                                onChange={handleSearchInputChange}
                                onKeyDown={handleKeyDown}
                            />
                            <button className="btn btn-outline-danger" onClick={handleClearFilters}>
                                Clear Filters
                            </button>

                            {showDropdown && suggestions.length > 0 && (
                                <div ref={dropdownRef} className="dropdown-menu show position-absolute"
                                     style={{ maxHeight: "200px", overflowY: "auto", top: "100%", zIndex: 1000 }}>
                                    {suggestions.map((suggestion) => (
                                        <button
                                            key={suggestion.id}
                                            className="dropdown-item"
                                            onClick={() => handleSuggestionClick(suggestion)}
                                        >
                                            {suggestion.category.eventCategory} - {suggestion.location.address.city.name}
                                        </button>
                                    ))}
                                </div>
                            )}
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
                                style={{ width: "150px", padding: "5px 10px", textAlign: "center" }}
                            >
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
                onShowEvents={handleCitySelection}
                selectedCategories={selectedCategories}
                previouslySelectedCity={selectedCity}
            />
        </div>
    );
};
