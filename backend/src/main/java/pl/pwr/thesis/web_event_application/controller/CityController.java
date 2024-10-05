package pl.pwr.thesis.web_event_application.controller;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.pwr.thesis.web_event_application.dto.list.CityDto;
import pl.pwr.thesis.web_event_application.service.interfaces.CityService;

import java.util.List;

@RestController
@RequestMapping("api/cities")
public class CityController {

    private final CityService cityService;
    private static final Logger logger = LoggerFactory.getLogger(CityController.class);

    public CityController(CityService cityService) {
        this.cityService = cityService;
    }

    @GetMapping
    public ResponseEntity<List<CityDto>> fetchAllCities() {
        logger.info("Received request to fetch all cities.");
        List<CityDto> cities = cityService.getAllCities();
        if (cities.isEmpty()) {
            logger.info("There are no cities to fetch! Returning empty list status.");
        } else {
            logger.info("The number of fetched cities: {}", cities.size());
        }
        return new ResponseEntity<>(cities, HttpStatus.OK);
    }
}
