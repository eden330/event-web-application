package pl.pwr.thesis.web_event_application.scraper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import pl.pwr.thesis.web_event_application.entity.Event;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

@Component
public class EventConverter {

    private final Logger logger = Logger.getLogger(EventConverter.class.getName());

    public List<Event> convertJsonToEvents(Set<String> eventJsonSet) {
        List<Event> events = new ArrayList<>();
        ObjectMapper mapper = new ObjectMapper();
        try {
            for (var json : eventJsonSet) {
                Event event = mapper.readValue(json, Event.class);
                events.add(event);
            }
        } catch (JsonProcessingException e) {
            logger.log(Level.SEVERE, "Error in converting JSON to event: " + e.getMessage(), e);
        }
        return events;
    }
}
