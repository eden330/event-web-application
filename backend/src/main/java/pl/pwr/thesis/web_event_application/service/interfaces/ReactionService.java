package pl.pwr.thesis.web_event_application.service.interfaces;

import pl.pwr.thesis.web_event_application.entity.embedded.Reaction;

public interface ReactionService {

    void saveReaction(Reaction reaction);

    Long countReactionsTypeForSpecificEvent(Long eventId, String reactionType);
}
