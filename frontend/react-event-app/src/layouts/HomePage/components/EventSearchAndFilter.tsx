import React, {useState, useEffect, useRef} from "react";
import {CategoryButton} from "./CategoryButton";
import {CitiesModal} from "./CitiesModal";
import {fetchCategories, fetchCities, fetchEventsList} from "../../../api/eventApi";
import {CityModel} from "../models/CityModel";
import {CategoryModel} from "../models/CategoryModel";
import {EventModel} from "../models/EventModel";

interface EventSearchAndFilterProps {
    onShowEvents: (cityName: string | null, category: string | null, searchTerm?: string | null) => void;
    clearFilters: () => void;
}

export const EventSearchAndFilter: React.FC<EventSearchAndFilterProps> = ({onShowEvents, clearFilters}) => {
    const [showModal, setShowModal] = useState(false);
    const [cities, setCities] = useState<CityModel[]>([]);
    const [categories, setCategories] = useState<CategoryModel[]>([]);
    const [httpError, setHttpError] = useState<string | null>(null);
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [currentSearchTerm, setCurrentSearchTerm] = useState<string>("");
    const [suggestions, setSuggestions] = useState<EventModel[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    const handleCategoryClick = (category: string) => {
        if (selectedCategory === category) {
            setSelectedCategory(null);
            onShowEvents(selectedCity, null, searchTerm);
        } else {
            setSelectedCategory(category);
            onShowEvents(selectedCity, category, searchTerm);
        }
    };

    const handleCitySelection = (city: string | null) => {
        if (selectedCity === city) {
            return;
        }
        setSelectedCity(city);
        onShowEvents(city, selectedCategory, searchTerm);
    };

    const fetchSuggestions = async (searchValue: string) => {
        if (searchValue.length >= 3) {
            try {
                const suggestionResponse: EventModel[] = await fetchEventsList(
                    0,
                    10,
                    selectedCity || undefined,
                    selectedCategory || undefined,
                    searchValue
                );
                setSuggestions(suggestionResponse);
                setShowDropdown(true);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
                setSuggestions([]);
                setShowDropdown(false);
            }
        } else {
            setShowDropdown(false);
        }
    };

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = e.target.value;
        setCurrentSearchTerm(searchValue);

        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(() => {
            fetchSuggestions(searchValue);
        }, 400);
    };

    const handleSuggestionClick = (suggestion: EventModel) => {
        setCurrentSearchTerm(suggestion.name);
        setShowDropdown(false);
        handleSearch();
    };

    const handleSearch = () => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        if (currentSearchTerm === searchTerm) {
            return;
        }

        setSearchTerm(currentSearchTerm);
        onShowEvents(selectedCity, selectedCategory, currentSearchTerm);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleClearFilters = () => {
        setSelectedCity(null);
        setSelectedCategory(null);
        setSearchTerm('')
        setCurrentSearchTerm('');

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
            loadCities();
        }
    }, [showModal]);

    useEffect(() => {
        loadCategories();
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
                                    <CategoryButton
                                        key={category.id}
                                        label={category.eventCategory}
                                        image={category.image}
                                        onClick={handleCategoryClick}
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
                                ref={searchInputRef}  // Add reference to the search input
                                className="form-control me-2 mt-3"
                                type="search"
                                placeholder="Search events"
                                aria-label="Search"
                                value={currentSearchTerm} // Use current search term in input
                                onChange={handleSearchInputChange}
                                onKeyDown={handleKeyDown}
                            />
                            <button className="btn btn-outline-danger" onClick={handleClearFilters}>
                                Clear Filters
                            </button>

                            {showDropdown && suggestions.length > 0 && (
                                <div ref={dropdownRef} className="dropdown-menu show position-absolute"
                                     style={{maxHeight: '200px', overflowY: 'auto', top: '100%', zIndex: 1000}}>
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
                onShowEvents={handleCitySelection}
                selectedCategory={selectedCategory}
            />
        </div>
    );
};
