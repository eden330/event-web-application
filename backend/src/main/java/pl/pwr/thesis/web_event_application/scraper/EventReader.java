package pl.pwr.thesis.web_event_application.scraper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import pl.pwr.thesis.web_event_application.entity.Event;

import java.net.MalformedURLException;
import java.util.List;
import java.util.Set;

@Component
public class EventReader {

    private final EventConverter eventConverter;
    private final WebScraper webScraper;
    private static final Logger logger = LoggerFactory.getLogger(EventReader.class);

    public EventReader(EventConverter eventConverter, WebScraper webScraper) {
        this.eventConverter = eventConverter;
        this.webScraper = webScraper;
    }

    public List<Event> readEvents() throws MalformedURLException {
        Set<String> eventJsonSet = webScraper.scrapEvents();
        List<Event> events = eventConverter.convertJsonToEvents(eventJsonSet);
        // events.forEach(System.out::println);
        logger.info("Number of json elements converted to events: " + events.size());
        return events;
    }
}
