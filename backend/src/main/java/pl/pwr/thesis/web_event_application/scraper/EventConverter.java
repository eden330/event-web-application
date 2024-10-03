package pl.pwr.thesis.web_event_application.scraper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import pl.pwr.thesis.web_event_application.entity.Event;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Component
public class EventConverter {

    private static final Logger logger = LoggerFactory.getLogger(EventConverter.class);

    public List<Event> convertJsonToEvents(Set<String> eventJsonSet) {
        List<Event> events = new ArrayList<>();
        ObjectMapper mapper = new ObjectMapper();
        try {
            for (var json : eventJsonSet) {
                Event event = mapper.readValue(json, Event.class);
                events.add(event);
            }
        } catch (JsonProcessingException e) {
            logger.error( "Error in converting JSON to event: " + e.getMessage(), e);
        }
        return events;
    }
}
