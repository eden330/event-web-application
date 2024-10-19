import React, {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useForm, SubmitHandler} from "react-hook-form";
import {isEmail} from "validator";
import {register} from "../../actions/auth";
import {RootState, AppDispatch} from "../../store";
import {useNavigate} from "react-router-dom";
import './css/Auth.css';

interface IFormInput {
    username: string;
    email: string;
    password: string;
}

export const Register: React.FC = () => {
    const {register: formRegister, handleSubmit, formState: {errors}} = useForm<IFormInput>();
    const [successful, setSuccessful] = useState(false);
    const {message} = useSelector((state: RootState) => state.message);
    const dispatch: AppDispatch = useDispatch();
    const navigate = useNavigate();

    const onSubmit: SubmitHandler<IFormInput> = (data) => {
        const {username, email, password} = data;
        setSuccessful(false);

        dispatch(register(username, email, password))
            .then(() => {
                setSuccessful(true);
                navigate("/home");
            })
            .catch(() => {
                setSuccessful(false);
            });
    };

    return (
        <div className="col-md-12">
            <div className="card card-container">
                <img
                    src="//ssl.gstatic.com/accounts/ui/avatar_2x.png"
                    alt="profile-img"
                    className="profile-img-card"
                />

                <form onSubmit={handleSubmit(onSubmit)}>
                    {!successful && (
                        <div>
                            <div className="form-group">
                                <label htmlFor="username">Username</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    {...formRegister("username", {
                                        required: "Username is required",
                                        minLength: {value: 3, message: "Username must be at least 3 characters"},
                                        maxLength: {value: 20, message: "Username cannot be longer than 20 characters"}
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
                                        minLength: {value: 6, message: "Password must be at least 6 characters"},
                                        maxLength: {value: 40, message: "Password cannot exceed 40 characters"}
                                    })}
                                />
                                {errors.password && (
                                    <div className="alert alert-danger" role="alert">
                                        {errors.password.message}
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <button className="btn btn-primary btn-block">Sign Up</button>
                            </div>
                        </div>
                    )}

                    {message && (
                        <div className="form-group">
                            <div className={successful ? "alert alert-success" : "alert alert-danger"} role="alert">
                                {message}
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};
