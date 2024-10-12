package pl.pwr.thesis.web_event_application.service.interfaces;

import pl.pwr.thesis.web_event_application.dto.list.CityDto;
import pl.pwr.thesis.web_event_application.entity.City;

import java.util.List;

public interface CityService {

    List<CityDto> getAllCities();

    City findOrSaveCity(City city);

    CityDto findCityByName(String cityName);

    void deleteCity(City city);
}
