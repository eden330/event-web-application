package pl.pwr.thesis.web_event_application.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.pwr.thesis.web_event_application.dto.list.EventDto;
import pl.pwr.thesis.web_event_application.dto.map.EventDtoMap;
import pl.pwr.thesis.web_event_application.entity.Address;
import pl.pwr.thesis.web_event_application.entity.City;
import pl.pwr.thesis.web_event_application.entity.Event;
import pl.pwr.thesis.web_event_application.entity.Location;
import pl.pwr.thesis.web_event_application.mapper.list.EventMapper;
import pl.pwr.thesis.web_event_application.mapper.map.EventMapperMap;
import pl.pwr.thesis.web_event_application.repository.EventRepository;
import pl.pwr.thesis.web_event_application.service.interfaces.AddressService;
import pl.pwr.thesis.web_event_application.service.interfaces.CityService;
import pl.pwr.thesis.web_event_application.service.interfaces.EventService;
import pl.pwr.thesis.web_event_application.service.interfaces.LocationService;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final EventMapperMap eventMapperMap;
    private final EventMapper eventMapperList;
    private final LocationService locationService;
    private final AddressService addressService;
    private final CityService cityService;
    private static final Logger logger = LoggerFactory.getLogger(CityServiceImpl.class);


    public EventServiceImpl(EventRepository eventRepository, EventMapperMap eventMapperMap,
                            EventMapper eventMapperList, LocationService locationService,
                            AddressService addressService, CityService cityService) {
        this.eventRepository = eventRepository;
        this.eventMapperMap = eventMapperMap;
        this.eventMapperList = eventMapperList;
        this.locationService = locationService;
        this.addressService = addressService;
        this.cityService = cityService;
    }

    @Override
    public List<EventDtoMap> fetchAllEventsMap() {
        logger.info("Fetching all events from database to Map");
        try {
            return eventRepository.findAllWithLocation()
                    .stream()
                    .map(eventMapperMap::eventToDtoMap)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error in fetching all events", e);
            throw new RuntimeException("Error fetching events", e);
        }
    }

    @Override
    public List<EventDto> fetchAllEventsList(int page, int size) {
        logger.info("Fetching all events from database to List");
        Pageable pageable = PageRequest.of(page, size);
        try {
            Page<Event> eventsPage = eventRepository.findAll(pageable);
            return eventsPage.stream()
                    .map(eventMapperList::eventToDto)
                    .toList();
        } catch (Exception e) {
            logger.error("Error in fetching all events", e);
            throw new RuntimeException("Error fetching events", e);
        }
    }

    @Override
    public boolean checkIfEventExist(Event event) {
        return eventRepository.existsByNameAndLocationAndStartDateAndEndDate(
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
                logger.error("Error when saving list of events to database", e);
            }
        } else {
            logger.info("No events to save! The list is empty.");
        }
        System.out.println("Events saved to database: " + addedEvents.size());
        System.out.println("Events not saved to database: " + otherEvents.size());
        // otherEvents.forEach(System.out::println);
    }

    @Override
    @Transactional
    public boolean saveEvent(Event event) {
        Location location = event.getLocation();
        if (location != null) {
            Address address = location.getAddress();
            if (address != null) {
                City city = cityService.findOrSaveCity(address.getCity());
                address.setCity(city);

                Address savedAddress = addressService.findOrSaveAddress(address);
                location.setAddress(savedAddress);
            }
            Location savedLocation = locationService.findOrSaveLocation(location);
            event.setLocation(savedLocation);
        }

        if (!checkIfEventExist(event)) {
            try {
                eventRepository.save(event);
                return true;
            } catch (Exception e) {
                logger.error("Error when saving event: {} to database", event.getName(), e);
                throw new RuntimeException("Failed to save event: " + event.getName(), e);
            }
        } else {
            logger.warn("Event {} not saved! It already exists in database.", event.getName());
        }
        return false;
    }
}
