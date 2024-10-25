package pl.pwr.thesis.web_event_application.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.pwr.thesis.web_event_application.entity.embedded.Reaction;
import pl.pwr.thesis.web_event_application.entity.embedded.ReactionKey;
import pl.pwr.thesis.web_event_application.enums.ReactionType;

import java.util.List;

@Repository
public interface ReactionRepository extends JpaRepository<Reaction, ReactionKey> {

    List<Reaction> findReactionsByEventId(Long eventId);

    List<Reaction> findReactionsByUserId(Long userId);

    Long countReactionsByEventIdAndType(Long eventId, ReactionType reactionType);
}
