package pl.pwr.thesis.web_event_application.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pl.pwr.thesis.web_event_application.entity.Event;

import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {

    Optional<Event> findEventByName(String eventName);

    @Query("SELECT e FROM Event e WHERE e.location.address.city.id = :cityId")
    List<Event> findEventsByCityId(@Param("cityId") Long cityId);

    List<Event> findEventsByCategoryId(Long categoryId);
}
