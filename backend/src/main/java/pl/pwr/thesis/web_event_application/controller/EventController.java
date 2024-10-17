package pl.pwr.thesis.web_event_application.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pl.pwr.thesis.web_event_application.dto.list.EventDto;
import pl.pwr.thesis.web_event_application.dto.map.EventDtoMap;
import pl.pwr.thesis.web_event_application.entity.Event;
import pl.pwr.thesis.web_event_application.scraper.EventReader;
import pl.pwr.thesis.web_event_application.service.interfaces.EventService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("api/events")
@CrossOrigin(origins = "http://localhost:3000")
public class EventController {

    private final EventService eventService;
    private final EventReader eventReader;
    private static final Logger logger = LoggerFactory.getLogger(EventController.class);

    public EventController(EventService eventService, EventReader eventReader) {
        this.eventService = eventService;
        this.eventReader = eventReader;
    }

    @GetMapping("/count")
    public ResponseEntity<Long> countOfEvents() {
        try {
            long countOfEvents = eventService.countEvents();
            logger.info("Number of events fetched: {}", countOfEvents);
            return new ResponseEntity<>(countOfEvents, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error in counting number of events", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventDto> fetchEventById(@PathVariable long id) {
        logger.info("Fetching event with id {}", id);
        try {
            Optional<EventDto> event = eventService.fetchEventById(id);
            return event.map(ResponseEntity::ok).orElseGet(
                    () -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
        } catch (Exception e) {
            logger.error("Error in fetching event by id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/list")
    public ResponseEntity<List<EventDto>> fetchAllEventsList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String cityName,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String searchTerm
    ) {
        try {
            List<EventDto> eventDtos = eventService
                    .fetchAllEventsList(page, size,
                            Optional.ofNullable(cityName),
                            Optional.ofNullable(category),
                            Optional.ofNullable(searchTerm));
            return checkFetchedData(eventDtos, "list");
        } catch (Exception e) {
            logger.error("Error in fetching events for list", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/map")
    public ResponseEntity<List<EventDtoMap>> fetchAllEventsList(
            @RequestParam(required = false) String cityName,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String searchTerm
    ) {
        try {
            List<EventDtoMap> eventDtos = eventService
                    .fetchAllEventsMap(
                            Optional.ofNullable(cityName),
                            Optional.ofNullable(category),
                            Optional.ofNullable(searchTerm));
            return checkFetchedData(eventDtos, "map");
        } catch (Exception e) {
            logger.error("Error in fetching events for list", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private <T> ResponseEntity<List<T>> checkFetchedData(List<T> events, String type) {
        if (events.isEmpty()) {
            logger.warn("No events fetched from database for {}!", type);
            return ResponseEntity.noContent().build();
        }
        logger.info("Number of events fetched: {} for {} ", events.size(), type);
        return ResponseEntity.ok(events);
    }

    @PostMapping
    public ResponseEntity<String> saveEvents() {
        List<Event> events = eventReader.readEvents();
        if (events.isEmpty()) {
            logger.warn("No events to be saved! Returning empty list status.");
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body("No events found to save");
        }
        try {
            var searchEventsResult = eventService.saveEvents(events);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body("Successfully saved " + searchEventsResult.getSavedEventsCount() + " events. " +
                            searchEventsResult.getNotSavedEventsCount() + " events were not saved.");
        } catch (Exception e) {
            logger.error("Error occurred while saving events", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error occurred while saving events.");
        }
    }
}
