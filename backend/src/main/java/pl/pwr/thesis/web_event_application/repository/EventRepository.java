package pl.pwr.thesis.web_event_application.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pl.pwr.thesis.web_event_application.entity.Event;
import pl.pwr.thesis.web_event_application.entity.Location;

import java.time.LocalDateTime;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    boolean existsByNameAndLocationAndStartDateAndEndDate(
            String name, Location location, LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT e FROM Event e WHERE e.location.address.city.id = :cityId")
    List<Event> findEventsByCityId(@Param("cityId") Long cityId);

    List<Event> findEventsByCategoryId(Long categoryId);
}
