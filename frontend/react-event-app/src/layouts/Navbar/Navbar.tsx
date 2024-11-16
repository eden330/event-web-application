import React, {useEffect} from "react";
import './css/Navbar.css';
import {NavItem} from "./components/NavItem";
import {useDispatch, useSelector} from "react-redux";
import {Link, useNavigate} from "react-router-dom";
import {AppDispatch, RootState} from "../../store";
import {logout} from "../../actions/auth";

export const Navbar: React.FC = () => {
    const {user: currentUser} = useSelector((state: RootState) => state.auth);
    const dispatch: AppDispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
    };

    useEffect(() => {
        if (!currentUser) {
            navigate("/home");
        }
    }, [currentUser]);

    return (
        <nav className={"navbar navbar-expand-lg navbar-light bg-light small-navbar"}>
            <div className={"container-fluid"}>
                <span className={"navbar-brand"}>Event App</span>
                <button
                    className={"navbar-toggler"}
                    type={"button"}
                    data-bs-toggle={"collapse"}
                    data-bs-target={"#navbarNavDropdown"}
                    aria-controls={"navbarNavDropdown"}
                    aria-expanded={"false"}
                    aria-label={"Toggle Navigation"}
                >
                    <span className={"navbar-toggler-icon"}></span>
                </button>
                <div className={"collapse navbar-collapse"} id={"navbarNavDropdown"}>
                    <ul className={"navbar-nav ms-auto"}>
                        <NavItem label={"Explore events"} to={"/home"} />
                        {currentUser ? (
                            <>
                                <NavItem label={"My profile"} to={"/profile"} />
                                <NavItem label={"Favourite Events"} to={"/favourites"} />
                                <NavItem label={"Recommended Events"} to={"/recommended"} />

                                {currentUser.roles.includes("ROLE_ADMIN") && (
                                    <>
                                        <NavItem label={"User Panel"} to={"/users"} />
                                        <NavItem label={"Events Panel"} to={"/events"} />
                                    </>
                                )}

                                <li className={"nav-item mx-4"}>
                                    <button className={"btn btn-outline-light"} onClick={handleLogout}>
                                        Log Out
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className={"nav-item mx-4"}>
                                    <Link className={"btn btn-outline-light"} to={"/login"}>
                                        Sign In
                                    </Link>
                                </li>
                                <li className={"nav-item mx-4"}>
                                    <Link className={"btn btn-outline-light"} to={"/register"}>
                                        Sign Up
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );

};
