package pl.pwr.thesis.web_event_application.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.pwr.thesis.web_event_application.dto.SearchEventsResult;
import pl.pwr.thesis.web_event_application.dto.list.EventDto;
import pl.pwr.thesis.web_event_application.dto.map.EventDtoMap;
import pl.pwr.thesis.web_event_application.entity.Address;
import pl.pwr.thesis.web_event_application.entity.Category;
import pl.pwr.thesis.web_event_application.entity.City;
import pl.pwr.thesis.web_event_application.entity.Event;
import pl.pwr.thesis.web_event_application.entity.Location;
import pl.pwr.thesis.web_event_application.enums.EventCategory;
import pl.pwr.thesis.web_event_application.geocode.Geocoder;
import pl.pwr.thesis.web_event_application.mapper.EventMapper;
import pl.pwr.thesis.web_event_application.repository.EventRepository;
import pl.pwr.thesis.web_event_application.repository.specification.EventSpecifications;
import pl.pwr.thesis.web_event_application.service.interfaces.AddressService;
import pl.pwr.thesis.web_event_application.service.interfaces.CategoryService;
import pl.pwr.thesis.web_event_application.service.interfaces.CityService;
import pl.pwr.thesis.web_event_application.service.interfaces.EventService;
import pl.pwr.thesis.web_event_application.service.interfaces.LocationService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final EventMapper eventMapper;
    private final LocationService locationService;
    private final AddressService addressService;
    private final CityService cityService;
    private final CategoryService categoryService;
    private final Geocoder geocoder;
    private static final Logger logger = LoggerFactory.getLogger(EventServiceImpl.class);


    public EventServiceImpl(EventRepository eventRepository, EventMapper eventMapper,
                            LocationService locationService, AddressService addressService,
                            CityService cityService, CategoryService categoryService,
                            Geocoder geocoder) {
        this.eventRepository = eventRepository;
        this.eventMapper = eventMapper;
        this.locationService = locationService;
        this.addressService = addressService;
        this.cityService = cityService;
        this.categoryService = categoryService;
        this.geocoder = geocoder;
    }

    @Override
    public long countEvents() {
        return eventRepository.count();
    }

    @Override
    public Optional<EventDto> fetchEventById(long id) {
        return eventRepository.findById(id).map(eventMapper::eventToDto);
    }

    @Override
    public boolean checkIfEventExist(Event event) {
        return eventRepository.existsByNameAndLocationAndStartDateAndEndDate(
                event.getName(), event.getLocation(),
                event.getStartDate(), event.getEndDate());
    }

    public List<EventDto> fetchAllEventsList(int page, int size,
                                             Optional<String> city,
                                             Optional<String> category,
                                             Optional<String> searchTerm) {
        Pageable pageable = PageRequest.of(page, size);
        Specification<Event> spec = buildEventSpecification(city, category, searchTerm);

        try {
            logger.info("Fetching {} events to List", size);
            Page<Event> eventPage = eventRepository.findAll(spec, pageable);
            logger.info("Number of events: {} fetched to List", size);
            return eventPage.stream()
                    .map(eventMapper::eventToDto)
                    .toList();
        } catch (Exception e) {
            logger.error("Error in fetching all events", e);
            throw new RuntimeException("Error fetching events", e);
        }
    }


    public List<EventDtoMap> fetchAllEventsMap(Optional<String> city,
                                               Optional<String> category,
                                               Optional<String> searchTerm) {
        Specification<Event> spec = buildEventSpecification(city, category, searchTerm);

        try {
            logger.info("Fetching all events to Map");
            List<Event> events = eventRepository.findAll(spec);
            logger.info("Number of events: {} fetched to Map", events.size());
            return events.stream()
                    .map(eventMapper::eventToDtoMap)
                    .toList();
        } catch (Exception e) {
            logger.error("Error in fetching all events for Map", e);
            throw new RuntimeException("Error fetching events", e);
        }
    }

    private Specification<Event> buildEventSpecification(Optional<String> city,
                                                         Optional<String> category,
                                                         Optional<String> searchTerm) {
        Specification<Event> spec = Specification.where(null);

        if (city.isPresent()) {
            String cityName = city.get();
            logger.info("Applying filter by city name: {}", cityName);
            spec = spec.and(EventSpecifications.hasCityName(cityName));
        }
        if (category.isPresent()) {
            String categoryName = category.get();
            EventCategory eventCategory = EventCategory.valueOf(categoryName.toUpperCase());
            logger.info("Applying filter by category name: {}", categoryName);
            spec = spec.and(EventSpecifications.hasCategory(eventCategory));
        }
        if (searchTerm.isPresent()) {
            String term = searchTerm.get();
            logger.info("Applying filter by search term: {}", term);
            spec = spec.and(EventSpecifications.eventTitleOrLocationOrCityContains(term));
        }

        return spec;
    }


    @Override
    public SearchEventsResult saveEvents(List<Event> events) {
        List<Event> notSavedEvents = new ArrayList<>();
        List<Event> savedEvents = new ArrayList<>();

        if (!events.isEmpty()) {
            logger.debug("Saving {} events to the database", events.size());

            for (Event event : events) {
                try {
                    saveEvent(event);
                    savedEvents.add(event);
                } catch (Exception e) {
                    logger.error("Error when saving event: {} to the database", event.getName(), e);
                    notSavedEvents.add(event);
                }
            }
        } else {
            logger.info("No events to save! The list is empty.");
        }
        return new SearchEventsResult(
                savedEvents.size(), notSavedEvents.size(),
                savedEvents, notSavedEvents
        );
    }

    @Override
    @Transactional
    public void saveEvent(Event event) {
        Location location = event.getLocation();
        if (location == null) {
            throw new IllegalArgumentException("Location is missing for event: " + event.getName());
        }

        Address address = location.getAddress();
        if (address == null) {
            throw new IllegalArgumentException("Address is missing for event: " + event.getName());
        }

        String streetName = address.getStreet();
        String cityName = address.getCity().getName();

        if (streetName.isBlank() || cityName.isBlank()) {
            logger.warn("Event {} not saved! Street or City is empty.", event.getName());
            throw new IllegalArgumentException("Street or City cannot be empty.");
        }

        City city = cityService.findOrSaveCity(address.getCity());

        if (city.getLatitude() == 0 || city.getLongitude() == 0) {
            double[] cityCoordinates = geocoder.geocodeLocationWithRetries(cityName, "");
            if (cityCoordinates == null) {
                logger.warn("Geocoding failed for city: {}, event not saved to database.", cityName);
                throw new IllegalStateException("Geocoding failed for city: " + cityName);
            }
            city.setLatitude(cityCoordinates[0]);
            city.setLongitude(cityCoordinates[1]);
        }

        address.setCity(city);
        Address savedAddress = addressService.findOrSaveAddress(address);
        location.setAddress(savedAddress);

        Location savedLocation = locationService.findOrSaveLocation(location);
        event.setLocation(savedLocation);

        Category category = categoryService.findOrSaveCategory(event.getCategory());
        event.setCategory(category);

        if (checkIfEventExist(event)) {
            logger.warn("Event: {} not saved! It already exists in the database.", event.getName());
            throw new IllegalStateException("Event already exists: " + event.getName());
        }

        if (savedLocation.getLongitude() == 0 || savedLocation.getLatitude() == 0) {
            double[] coordinates = geocoder.geocodeLocationWithRetries(
                    savedLocation.getAddress().getCity().getName(),
                    savedLocation.getAddress().getStreet()
            );
            if (coordinates == null) {
                logger.warn("Geocoding failed for event: {}, event not saved to database.", event.getName());
                throw new IllegalStateException("Geocoding failed for location: " + event.getName());
            }
            savedLocation.setLatitude(coordinates[0]);
            savedLocation.setLongitude(coordinates[1]);
            event.setLocation(savedLocation);
        }
        eventRepository.save(event);
    }
}
