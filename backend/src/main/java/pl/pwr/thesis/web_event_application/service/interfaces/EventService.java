package pl.pwr.thesis.web_event_application.service.interfaces;

import pl.pwr.thesis.web_event_application.entity.Event;

import java.util.List;

public interface EventService {

    void saveEvents(List<Event> events);

    void saveEvent(Event event);

    boolean checkIfEventExist(Event event);
}
