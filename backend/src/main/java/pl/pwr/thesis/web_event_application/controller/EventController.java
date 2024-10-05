package pl.pwr.thesis.web_event_application.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.pwr.thesis.web_event_application.dto.EventDto;
import pl.pwr.thesis.web_event_application.entity.Event;
import pl.pwr.thesis.web_event_application.scraper.EventReader;
import pl.pwr.thesis.web_event_application.service.interfaces.EventService;

import java.util.List;

@RestController
@RequestMapping("api/events")
public class EventController {

    private final EventService eventService;
    private final EventReader eventReader;
    private static final Logger logger = LoggerFactory.getLogger(EventController.class);

    public EventController(EventService eventService, EventReader eventReader) {
        this.eventService = eventService;
        this.eventReader = eventReader;
    }

    @GetMapping
    public ResponseEntity<List<EventDto>> fetchAllEvents() {
        try {
            List<EventDto> eventDtos = eventService.fetchAllEvents();
            if (eventDtos.isEmpty()) {
                logger.warn("No events fetched!");
                return ResponseEntity.noContent().build();
            }
            logger.info("Number of events fetched: {}", eventDtos.size());
            return ResponseEntity.ok(eventDtos);
        } catch (Exception e) {
            logger.error("Error in fetching all of the events", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<String> saveEvents() {
        List<Event> events = eventReader.readEvents();
        if (events.isEmpty()) {
            logger.warn("No events to be saved! Returning empty list status.");
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body("No events found to save");
        }
        try {
            eventService.saveEvents(events);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body("Successfully saved " + events.size() + " events.");
        } catch (Exception e) {
            logger.error("Error occurred while saving events", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error occurred while saving events.");
        }
    }
}
