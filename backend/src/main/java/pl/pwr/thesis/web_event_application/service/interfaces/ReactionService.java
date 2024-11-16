package pl.pwr.thesis.web_event_application.service.interfaces;

import pl.pwr.thesis.web_event_application.dto.user.ReactedEventDto;

import java.util.List;

public interface ReactionService {

    Long countReactionsTypeForSpecificEvent(Long eventId, String reactionType);

    List<ReactedEventDto> findReactedEventIdsAndTypesByUserId(Long userId);
}
