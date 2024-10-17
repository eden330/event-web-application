package pl.pwr.thesis.web_event_application.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pl.pwr.thesis.web_event_application.entity.embedded.Reaction;
import pl.pwr.thesis.web_event_application.entity.embedded.ReactionKey;
import pl.pwr.thesis.web_event_application.enums.ReactionType;

import java.util.List;

@Repository
public interface ReactionRepository extends JpaRepository<Reaction, ReactionKey> {

    List<Reaction> findReactionsByEventId(Long eventId);

    List<Reaction> findReactionsByUserId(Long userId);

    @Query("SELECT r FROM Reaction r WHERE r.user.id = :userId AND r.event.id = :eventId" +
            " AND r.type = :reactionType")
    Reaction checkIfUserReactedForSpecificEvent(@Param("userId") Long userId,
                                               @Param("eventId") Long eventId,
                                               @Param("reactionType") ReactionType reactionType);

}
