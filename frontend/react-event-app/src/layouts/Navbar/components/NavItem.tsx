import React from "react";
import {NavLink} from "react-router-dom";

interface NavItemProps {
    label: string;
    href?: string;
    to?: string;
}

export const NavItem: React.FC<NavItemProps> = ({label, href, to}) => {
    return (
        <li className="nav-item mx-4">
            {to ? (
                <NavLink
                    className={({isActive}) => (isActive ? "nav-link active" : "nav-link")}
                    to={to}>
                    {label}
                </NavLink>
            ) : (
                <a className="nav-link" href={href}>
                    {label}
                </a>
            )}
        </li>
    );
};
