package pl.pwr.thesis.web_event_application.service.interfaces;

import pl.pwr.thesis.web_event_application.dto.list.EventDto;
import pl.pwr.thesis.web_event_application.dto.map.EventDtoMap;
import pl.pwr.thesis.web_event_application.entity.Event;

import java.util.List;

public interface EventService {

    void saveEvents(List<Event> events);

    boolean saveEvent(Event event);

    boolean checkIfEventExist(Event event);

    List<EventDtoMap> fetchAllEventsMap();

    List<EventDto> fetchAllEventsList(int page, int size);
}
