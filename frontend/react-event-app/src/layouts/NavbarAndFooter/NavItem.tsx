import React from "react";


interface NavItemProps {
    label: string;
    href: string;
}

export const NavItem: React.FC<NavItemProps> = ({label, href}) => {
    return (
        <li className={"nav-item mx-4"}>
            <a className={"nav-link"} href={href}>{label}</a>
        </li>
    )
}