package pl.pwr.thesis.web_event_application.service.interfaces;

import pl.pwr.thesis.web_event_application.dto.SearchEventsResult;
import pl.pwr.thesis.web_event_application.dto.list.EventDto;
import pl.pwr.thesis.web_event_application.dto.map.EventDtoMap;
import pl.pwr.thesis.web_event_application.entity.Event;

import java.util.List;
import java.util.Optional;

public interface EventService {

    SearchEventsResult saveEvents(List<Event> events);

    long countEvents();

    void saveEvent(Event event);

    boolean checkIfEventExist(Event event);

    List<EventDto> fetchAllEventsList(int page, int size,
                                      Optional<String> city,
                                      Optional<List<String>> categories,
                                      Optional<String> searchTerm);

    List<EventDtoMap> fetchAllEventsMap(Optional<String> city,
                                        Optional<List<String>> categories,
                                        Optional<String> searchTerm);

    Optional<EventDto> fetchEventById(long id);
}
