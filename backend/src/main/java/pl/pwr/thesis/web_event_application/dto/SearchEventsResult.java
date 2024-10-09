package pl.pwr.thesis.web_event_application.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import pl.pwr.thesis.web_event_application.entity.Event;

import java.util.List;

@Getter
@AllArgsConstructor
public class SearchEventsResult {

    private int savedEventsCount;
    private int notSavedEventsCount;
    private List<Event> savedEvents;
    private List<Event> notSavedEvents;
}
