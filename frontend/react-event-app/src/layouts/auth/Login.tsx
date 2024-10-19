import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Navigate, useNavigate} from "react-router-dom";
import {useForm, SubmitHandler} from "react-hook-form";
import {login} from "../../actions/auth";
import {AppDispatch, RootState} from "../../store";
import './css/Auth.css';

interface IFormInput {
    username: string;
    password: string;
}

export const Login: React.FC = () => {
    const {register, handleSubmit, formState: {errors}} = useForm<IFormInput>();
    const [loading, setLoading] = useState<boolean>(false);

    const {isLoggedIn} = useSelector((state: RootState) => state.auth);
    const {message} = useSelector((state: RootState) => state.message);

    const dispatch: AppDispatch = useDispatch();
    const navigate = useNavigate();

    const onSubmit: SubmitHandler<IFormInput> = (data) => {
        setLoading(true);
        const {username, password} = data;

        dispatch(login(username, password))
            .then(() => {
                navigate("/home");
            })
            .catch(() => {
                setLoading(false);
            });
    };

    if (isLoggedIn) {
        return <Navigate to="/profile"/>;
    }

    return (
        <div className="col-md-12">
            <div className="card card-container">
                <img
                    src="//ssl.gstatic.com/accounts/ui/avatar_2x.png"
                    alt="profile-img"
                    className="profile-img-card"
                />

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            className="form-control"
                            {...register("username", {required: "Username is required"})}
                        />
                        {errors.username && (
                            <div className="alert alert-danger" role="alert">
                                {errors.username.message}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            {...register("password", {
                                required: "Password is required",
                                minLength: {value: 6, message: "Password must be at least 6 characters long"}
                            })}
                        />
                        {errors.password && (
                            <div className="alert alert-danger" role="alert">
                                {errors.password.message}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <button className="btn btn-primary btn-block" disabled={loading}>
                            {loading && (
                                <span className="spinner-border spinner-border-sm"></span>
                            )}
                            <span>Login</span>
                        </button>
                    </div>

                    {message && (
                        <div className="form-group">
                            <div className="alert alert-danger" role="alert">
                                {message}
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};
