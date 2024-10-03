package pl.pwr.thesis.web_event_application.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.pwr.thesis.web_event_application.dto.CityDto;
import pl.pwr.thesis.web_event_application.entity.City;
import pl.pwr.thesis.web_event_application.mapper.CityMapper;
import pl.pwr.thesis.web_event_application.repository.CityRepository;
import pl.pwr.thesis.web_event_application.service.interfaces.CityService;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CityServiceImpl implements CityService {

    private final CityRepository cityRepository;
    private final CityMapper cityMapper;
    private static final Logger logger = LoggerFactory.getLogger(CityServiceImpl.class);

    public CityServiceImpl(CityRepository cityRepository, CityMapper cityMapper) {
        this.cityRepository = cityRepository;
        this.cityMapper = cityMapper;
    }

    @Override
    public List<CityDto> getAllCities() {
        logger.info("Fetching all cities from database");
        return cityRepository.findAll().
                stream()
                .map(cityMapper::cityToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public City saveCity(City city) {
        return cityRepository.findCityByName(city.getName())
                .orElseGet(() -> cityRepository.save(city));
    }
}
