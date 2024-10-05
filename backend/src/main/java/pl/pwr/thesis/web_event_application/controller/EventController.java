package pl.pwr.thesis.web_event_application.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import pl.pwr.thesis.web_event_application.entity.Event;
import pl.pwr.thesis.web_event_application.scraper.EventReader;
import pl.pwr.thesis.web_event_application.service.interfaces.EventService;

import java.util.List;

@Controller
@RequestMapping("api/events")
public class EventController {

    private final EventService eventService;
    private final EventReader eventReader;
    private static final Logger logger = LoggerFactory.getLogger(EventController.class);

    public EventController(EventService eventService, EventReader eventReader) {
        this.eventService = eventService;
        this.eventReader = eventReader;
    }

    @PostMapping
    public ResponseEntity<List<Event>> saveEvents() {
        List<Event> events = eventReader.readEvents();
        logger.info("Received request to save {}  events ", events.size());
        if (events.isEmpty()) {
            logger.warn("No events to be saved! Returning NO_CONTENT status.");
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        try {
            eventService.saveEvents(events);
           // logger.info("Successfully saved {} events", events.size());
            return new ResponseEntity<>(events, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Error occurred while saving events", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
