import React from "react";
import '../css/SearchEvent.css';

interface CategoryAndCityButtonProps {
    label: string;
    image: string;
}

export const CategoryAndCityButton: React.FC<CategoryAndCityButtonProps> = ({ label, image }) => {
    return (
        <div className="col-auto d-flex flex-column justify-content-center align-items-center">
            <button className="btn btn-primary mt-2 rounded-btn">
                <img src={image} alt={label} className="button-image" />
            </button>
            <p className="btn-rounded-description">{label}</p>
        </div>
    );
};