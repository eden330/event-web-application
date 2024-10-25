package pl.pwr.thesis.web_event_application.service.impl;

import org.springframework.stereotype.Service;
import pl.pwr.thesis.web_event_application.entity.embedded.Reaction;
import pl.pwr.thesis.web_event_application.enums.ReactionType;
import pl.pwr.thesis.web_event_application.repository.ReactionRepository;
import pl.pwr.thesis.web_event_application.service.interfaces.ReactionService;

@Service
public class ReactionServiceImpl implements ReactionService {

    private final ReactionRepository reactionRepository;

    public ReactionServiceImpl(ReactionRepository reactionRepository) {
        this.reactionRepository = reactionRepository;
    }

    @Override
    public void saveReaction(Reaction reaction) {
        reactionRepository.save(reaction);
    }

    @Override
    public Long countReactionsTypeForSpecificEvent(Long eventId, String reactionType) {
        var reaction = ReactionType.valueOf(reactionType.toUpperCase());
        return reactionRepository.countReactionsByEventIdAndType(eventId, reaction);
    }
}
