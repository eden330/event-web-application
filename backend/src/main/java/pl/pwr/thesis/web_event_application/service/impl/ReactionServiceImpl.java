package pl.pwr.thesis.web_event_application.service.impl;

import org.springframework.stereotype.Service;
import pl.pwr.thesis.web_event_application.dto.user.ReactedEventDto;
import pl.pwr.thesis.web_event_application.enums.ReactionType;
import pl.pwr.thesis.web_event_application.repository.ReactionRepository;
import pl.pwr.thesis.web_event_application.service.interfaces.ReactionService;

import java.util.List;

@Service
public class ReactionServiceImpl implements ReactionService {

    private final ReactionRepository reactionRepository;

    public ReactionServiceImpl(ReactionRepository reactionRepository) {
        this.reactionRepository = reactionRepository;
    }

    @Override
    public Long countReactionsTypeForSpecificEvent(Long eventId, String reactionType) {
        var reaction = ReactionType.valueOf(reactionType.toUpperCase());
        return reactionRepository.countReactionsByEventIdAndType(eventId, reaction);
    }

    @Override
    public List<ReactedEventDto> findReactedEventIdsAndTypesByUserId(Long userId) {
        return reactionRepository.findReactedEventIdsAndTypesByUserId(userId);
    }
}
