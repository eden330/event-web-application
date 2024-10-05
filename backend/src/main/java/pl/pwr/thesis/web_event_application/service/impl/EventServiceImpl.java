package pl.pwr.thesis.web_event_application.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.pwr.thesis.web_event_application.entity.Address;
import pl.pwr.thesis.web_event_application.entity.City;
import pl.pwr.thesis.web_event_application.entity.Event;
import pl.pwr.thesis.web_event_application.entity.Location;
import pl.pwr.thesis.web_event_application.mapper.EventMapper;
import pl.pwr.thesis.web_event_application.repository.EventRepository;
import pl.pwr.thesis.web_event_application.service.interfaces.AddressService;
import pl.pwr.thesis.web_event_application.service.interfaces.CityService;
import pl.pwr.thesis.web_event_application.service.interfaces.EventService;
import pl.pwr.thesis.web_event_application.service.interfaces.LocationService;

import java.util.ArrayList;
import java.util.List;

@Service
public class EventServiceImpl implements EventService {

    private final EventRepository repository;
    private final EventMapper mapper;

    private final LocationService locationService;
    private final AddressService addressService;
    private final CityService cityService;
    private static final Logger logger = LoggerFactory.getLogger(CityServiceImpl.class);

    public EventServiceImpl(EventRepository repository, EventMapper mapper,
                            LocationService locationService, AddressService addressService,
                            CityService cityService) {
        this.repository = repository;
        this.mapper = mapper;
        this.locationService = locationService;
        this.addressService = addressService;
        this.cityService = cityService;
    }

    @Override
    public boolean checkIfEventExist(Event event) {
        return repository.existsByNameAndLocationAndStartDateAndEndDate(
                event.getName(), event.getLocation(),
                event.getStartDate(), event.getEndDate());
    }

    @Override
    @Transactional
    public void saveEvents(List<Event> events) {
        List<Event> addedEvents = new ArrayList<>();
        List<Event> otherEvents = new ArrayList<>();
        if (events != null && !events.isEmpty()) {
            logger.debug("Saving {} events to database", events.size());
            try {
                for (Event event : events) {
                    if (saveEvent(event)) {
                        addedEvents.add(event);
                    } else {
                        otherEvents.add(event);
                    }
                }
            } catch (Exception e) {
                logger.error("Error  when saving to database", e);
            }
        } else {
            logger.info("No events to save!");
        }
        System.out.println("Events saved to database: " + addedEvents.size());
        System.out.println("Events not saved to database: " + otherEvents.size());
        otherEvents.forEach(System.out::println);
    }

    @Override
    @Transactional
    public boolean saveEvent(Event event) {
        Location location = event.getLocation();
        if (location != null) {
            Address address = location.getAddress();
            if (address != null) {
                City city = cityService.saveCity(address.getCity());
                address.setCity(city);

                Address savedAddress = addressService.saveAddress(address);
                location.setAddress(savedAddress);
            }
            Location savedLocation = locationService.saveLocation(location);
            event.setLocation(savedLocation);
        }

        if (!checkIfEventExist(event)) {
            try {
                repository.save(event);
                return true;
            } catch (Exception e) {
                logger.error("Error when saving to database", e);
            }
        } else {
         //   logger.warn("Event not saved! It already exists in database.");
        }
        return false;
    }
}
