import React, {useEffect, useRef, useState} from "react";
import {CitiesModal} from "./CitiesModal";
import {fetchEventsList} from "../../../api/eventApi";
import {EventModel} from "../models/EventModel";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../../store";
import {fetchCategoriesData} from "../../../reducers/slices/categoriesDataSlice";
import {fetchCitiesData} from "../../../reducers/slices/citiesDataSlice";
import '../css/EventSearchAndFilter.css';

interface EventSearchAndFilterProps {
    onShowEvents: (cityName: string | null, categories: string[], searchTerm?: string | null, selectedEvent?: EventModel) => void;
    clearFilters: () => void;
}

export const EventSearchAndFilter: React.FC<EventSearchAndFilterProps> = ({onShowEvents, clearFilters}) => {
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

    const categories = useSelector((state: RootState) => state.categories.categories);
    const cities = useSelector((state: RootState) => state.cities.cities);

    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

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
        onShowEvents(selectedCity, selectedCategories, suggestion.name, suggestion);
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
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (showModal) dispatch(fetchCitiesData());
    }, [showModal, dispatch]);

    useEffect(() => {
        dispatch(fetchCategoriesData());
    }, [dispatch]);

    if (httpError) return <div className="container m-5"><p>{httpError}</p></div>;

    return (
        <div className="button-container">
            <div className="category-buttons">
                {categories.map((category) => (
                    <div
                        key={category.id}
                        className="category-item"
                        style={{backgroundImage: `url(${category.image})`}}
                        onClick={() => handleCategoryClick(category.eventCategory)}
                    >
                        <p className="category-label">{category.eventCategory}</p>
                    </div>
                ))}
            </div>

            <div className="col d-flex flex-column align-items-center">
                <div className="d-flex search-bar-wrapper" style={{position: "relative"}}>
                    <i
                        className="fas fa-search search-icon"
                        onClick={handleSearch}
                        style={{cursor: 'pointer'}}
                    />
                    <input
                        ref={searchInputRef}
                        className="form-control search-bar"
                        type="search"
                        placeholder="Search events"
                        aria-label="Search"
                        value={searchTerm}
                        onChange={handleSearchInputChange}
                        onKeyDown={handleKeyDown}
                    />
                    <button className="clear-filters" onClick={handleClearFilters}>
                        <i className="fas fa-times"></i> {/* Clear icon */}
                        CLEAR
                    </button>
                    {showDropdown && suggestions.length > 0 && (
                        <div className="suggestions-dropdown" ref={dropdownRef}>
                            {suggestions.map((suggestion) => (
                                <div
                                    key={suggestion.id}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    {suggestion.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="col d-flex flex-column align-items-center" style={{height: "100%"}}>
                <button className="btn btn-show-cities" onClick={handleShowModal}>
                </button>
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
