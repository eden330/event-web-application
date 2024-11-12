package pl.pwr.thesis.web_event_application.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pl.pwr.thesis.web_event_application.dto.user.ReactedEventDto;
import pl.pwr.thesis.web_event_application.entity.embedded.Reaction;
import pl.pwr.thesis.web_event_application.entity.embedded.ReactionKey;
import pl.pwr.thesis.web_event_application.enums.ReactionType;

import java.util.List;

@Repository
public interface ReactionRepository extends JpaRepository<Reaction, ReactionKey> {

    Long countReactionsByEventIdAndType(Long eventId, ReactionType reactionType);


    @Query("SELECT new pl.pwr.thesis.web_event_application.dto.user.ReactedEventDto(" +
            "r.event.id, r.type) " +
            "FROM Reaction r WHERE r.user.id = :userId")
    List<ReactedEventDto> findReactedEventIdsAndTypesByUserId(@Param("userId") Long userId);
}
