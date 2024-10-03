package pl.pwr.thesis.web_event_application.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.pwr.thesis.web_event_application.entity.Location;
import pl.pwr.thesis.web_event_application.repository.LocationRepository;
import pl.pwr.thesis.web_event_application.service.interfaces.LocationService;

@Service
public class LocationServiceImpl implements LocationService {

    private final LocationRepository repository;
    private static final Logger logger = LoggerFactory.getLogger(CityServiceImpl.class);

    public LocationServiceImpl(LocationRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public Location saveLocation(Location location) {
        return repository.findLocationByNameAndAddress(location.getName(), location.getAddress())
                .orElseGet(() -> repository.save(location));
    }
}
