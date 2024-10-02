import React from "react";
import {CategoryAndCityButton} from "./CategoryAndCityButton";

export const EventSearchAndFilter = () => {
    return (
        <div>
            <div className="container-fluid">
                <div className="row justify-content-center">
                    <div className="col-lg-4 col-12">
                        <div className="col d-flex justify-content-center align-items-center">
                            <h6>EVENT CATEGORIES</h6>
                        </div>
                        <div className="row justify-content-center">
                            <CategoryAndCityButton label="Sport"
                                                   imgSource="/images/SearchEventImages/sport-icon.png"/>
                            <CategoryAndCityButton label="Festival"
                                                   imgSource="/images/SearchEventImages/festival.png"/>
                            <CategoryAndCityButton label="Art" imgSource="/images/SearchEventImages/art-work.png"/>
                            <CategoryAndCityButton label="Theater"
                                                   imgSource="/images/SearchEventImages/theater-masks.png"/>
                        </div>
                    </div>
                    <div className="col-lg-4 col-12 ">
                        <div className="col d-flex justify-content-center align-items-center">
                            <h6>SEARCH EVENTS</h6>
                        </div>
                        <div className="d-flex">
                            <input
                                className="form-control me-2 mt-3"
                                type="search"
                                placeholder="Search events"
                                aria-label="Search"
                            />
                            <button className="btn btn-outline-success mt-3">Search</button>
                        </div>
                    </div>
                    <div className="col-lg-4 col-12">
                        <div className="col d-flex justify-content-center align-items-center">
                            <h6>EVENT CITIES</h6>
                        </div>
                        <div className="row justify-content-center">
                            <CategoryAndCityButton label="WWA" imgSource=""/>
                            <CategoryAndCityButton label="WRO" imgSource=""/>
                            <CategoryAndCityButton label="POZ" imgSource=""/>
                            <CategoryAndCityButton label="GDK" imgSource=""/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};
