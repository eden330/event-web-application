import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, SubmitHandler } from "react-hook-form";
import { isEmail } from "validator";
import { register } from "../../actions/auth";
import { RootState, AppDispatch } from "../../store";
import { useNavigate } from "react-router-dom";

import './css/Auth.css';
import { fetchCategories, fetchCities } from "../../api/eventApi";
import { CityModel } from "../HomePage/models/CityModel";
import { CategoryModel } from "../HomePage/models/CategoryModel";

interface IFormInput {
    username: string;
    email: string;
    password: string;
}
export const Register: React.FC = () => {
    const { register: formRegister, handleSubmit, formState: { errors } } = useForm<IFormInput>();
    const [successful, setSuccessful] = useState(false);
    const [step, setStep] = useState(1);
    const { message } = useSelector((state: RootState) => state.message);
    const dispatch: AppDispatch = useDispatch();
    const navigate = useNavigate();

    const [cities, setCities] = useState<CityModel[]>([]);
    const [categories, setCategories] = useState<CategoryModel[]>([]);
    const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

    const [userData, setUserData] = useState<IFormInput | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        if (step === 2) {
            fetchCities().then((data: CityModel[]) => setCities(data));
            fetchCategories().then((data: CategoryModel[]) => setCategories(data));
        }
    }, [step]);

    const onSubmitBasicInfo: SubmitHandler<IFormInput> = (data) => {
        setUserData(data);
        setStep(2);
    };

    const onSubmitCityCategory = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        setFormError(null);

        if (!selectedCityId || selectedCategories.length < 1 || selectedCategories.length > 3) {
            setFormError("Please select a city and between 1 to 3 categories.");
            return;
        }

        const cityId = selectedCityId!;
        const categories = selectedCategories;
        console.log({
            username: userData!.username,
            email: userData!.email,
            password: userData!.password,
            cityId: selectedCityId,
            categoriesId: selectedCategories
        });
        setSuccessful(false);
        dispatch(register(userData!.username, userData!.email, userData!.password, cityId, categories))
            .then(() => {
                setSuccessful(true);
                navigate("/home");
            })
            .catch(() => {
                setSuccessful(false);
            });
    };

    const handleCategoryClick = (categoryId: number) => {
        setSelectedCategories((prevCategories) =>
            prevCategories.includes(categoryId)
                ? prevCategories.filter((id) => id !== categoryId)
                : prevCategories.length < 3
                    ? [...prevCategories, categoryId]
                    : prevCategories
        );
    };

    return (
        <div className="col-md-12">
            <div className="card card-container">
                <img
                    src="//ssl.gstatic.com/accounts/ui/avatar_2x.png"
                    alt="profile-img"
                    className="profile-img-card"
                />

                {step === 1 && (
                    <form onSubmit={handleSubmit(onSubmitBasicInfo)}>
                        {!successful && (
                            <div>
                                <div className="form-group">
                                    <label htmlFor="username">Username</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        {...formRegister("username", {
                                            required: "Username is required",
                                            minLength: { value: 3, message: "Username must be at least 3 characters" },
                                            maxLength: { value: 20, message: "Username cannot be longer than 20 characters" }
                                        })}
                                    />
                                    {errors.username && (
                                        <div className="alert alert-danger" role="alert">
                                            {errors.username.message}
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        {...formRegister("email", {
                                            required: "Email is required",
                                            validate: (value) => isEmail(value) || "Invalid email address"
                                        })}
                                    />
                                    {errors.email && (
                                        <div className="alert alert-danger" role="alert">
                                            {errors.email.message}
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="password">Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        {...formRegister("password", {
                                            required: "Password is required",
                                            minLength: { value: 6, message: "Password must be at least 6 characters" },
                                            maxLength: { value: 40, message: "Password cannot exceed 40 characters" }
                                        })}
                                    />
                                    {errors.password && (
                                        <div className="alert alert-danger" role="alert">
                                            {errors.password.message}
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <button className="btn btn-primary btn-block">Next</button>
                                </div>
                            </div>
                        )}
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={onSubmitCityCategory}>
                        {!successful && (
                            <div>
                                <div className="form-group">
                                    <label htmlFor="city">City</label>
                                    <select
                                        className="form-control"
                                        value={selectedCityId || ""}
                                        onChange={(e) => setSelectedCityId(Number(e.target.value))}
                                        required
                                    >
                                        <option value="">Select City</option>
                                        {cities.map((city: CityModel) => (
                                            <option key={city.id} value={city.id}>
                                                {city.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="categories">Categories</label>
                                    <div className="categories-container">
                                        {categories.map((category: CategoryModel) => (
                                            <button
                                                key={category.id}
                                                type="button"
                                                className={`category-button ${selectedCategories.includes(category.id) ? "selected" : ""}`}
                                                onClick={() => handleCategoryClick(category.id)}
                                            >
                                                {category.eventCategory}
                                            </button>
                                        ))}
                                    </div>
                                    {formError && <div className="alert alert-danger mt-2">{formError}</div>}
                                </div>

                                <div className="form-group">
                                    <button className="btn btn-primary btn-block">Finish Registration</button>
                                </div>
                            </div>
                        )}
                    </form>
                )}

                {message && (
                    <div className="form-group">
                        <div className={successful ? "alert alert-success" : "alert alert-danger"} role="alert">
                            {message}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
