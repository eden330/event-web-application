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

    private final LocationRepository locationRepository;
    private static final Logger logger = LoggerFactory.getLogger(CityServiceImpl.class);

    public LocationServiceImpl(LocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }

    @Override
    @Transactional
    public Location findOrSaveLocation(Location location) {
        try {
            return locationRepository.findLocationByNameAndAddress(location.getName(), location.getAddress())
                    .orElseGet(() -> locationRepository.save(location));
        } catch (Exception e) {
            logger.error("Error in saving location: {} to database", location.getName(), e);
            throw new RuntimeException(e);
        }
    }
}
