import React from "react";
import './css/Navbar.css';
import { NavItem } from "./components/NavItem";

export const Navbar = () => {
    return (
        <nav className={"navbar navbar-expand-lg navbar-dark main-color py-2 small-navbar"}>
            <div className={"container-fluid"}>
                <span className={"navbar-brand"}> Event App</span>
                <button className={"navbar-toggler"} type={"button"}
                        data-bs-toggle={"collapse"} data-bs-target={"#navbarNavDropdown"}
                        aria-controls={"navbarNavDropdown"} aria-expanded={"false"}
                        aria-label={"Toggle Navigation"}>
                    <span className={"navbar-toggler-icon"}></span>
                </button>
                <div className={"collapse navbar-collapse"} id={"navbarNavDropdown"}>
                    <ul className={"navbar-nav ms-auto"}>
                        <NavItem label={"Explore events"} to={"/home"} />
                        <NavItem label={"My profile"} href={"#"} />
                        <NavItem label={"My favorites"} href={"#"} />
                        <li className={"nav-item mx-4"}>
                            <a type={"button"} className={"btn btn-outline-light"} href={"#"}>Sign in</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};
