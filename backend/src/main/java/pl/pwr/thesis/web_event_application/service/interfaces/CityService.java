package pl.pwr.thesis.web_event_application.service.interfaces;

import pl.pwr.thesis.web_event_application.dto.CityDto;
import pl.pwr.thesis.web_event_application.entity.City;

import java.util.List;

public interface CityService {

    List<CityDto> getAllCities();

    City saveCity(City city);
}
