package pl.pwr.thesis.web_event_application.service.interfaces;

import pl.pwr.thesis.web_event_application.dto.user.ReactedEventDto;
import pl.pwr.thesis.web_event_application.entity.embedded.Reaction;

import java.util.List;

public interface ReactionService {

    void saveReaction(Reaction reaction);

    Long countReactionsTypeForSpecificEvent(Long eventId, String reactionType);

    List<ReactedEventDto> findReactedEventIdsAndTypesByUserId(Long userId);
}
