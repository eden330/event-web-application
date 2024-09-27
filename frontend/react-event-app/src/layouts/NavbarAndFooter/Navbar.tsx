import React from "react";
import {NavItem} from "./NavItem";

export const Navbar = () => {
    return (
        <nav className={"navbar navbar-expand-lg navbar-dark main-color py-3"}>
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
                        <NavItem label={"Explore events"} href={"#"}></NavItem>
                        <NavItem label={"My profile"} href={"#"}></NavItem>
                        <NavItem label={"My favorites"} href={"#"}></NavItem>
                        <li className={"nav-item mx-4"}>
                            <a type={"button"} className={"btn btn-outline-light"} href={"#"}>Sign in</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}