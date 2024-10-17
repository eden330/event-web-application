import React from "react";
import '../css/HomePage.css';

interface CategoryAndCityButtonProps {
    label: string;
    image: string;
    onClick: (category: string) => void;
}

export const CategoryButton: React.FC<CategoryAndCityButtonProps> = ({ label, image, onClick }) => {
    return (
        <div className="col-auto d-flex flex-column justify-content-center align-items-center">
            <button className="btn btn-primary mt-2 rounded-btn" onClick={() => onClick(label)}>
                <img src={image} alt={label} className="button-image" />
            </button>
            <p className="btn-rounded-description">{label}</p>
        </div>
    );
};