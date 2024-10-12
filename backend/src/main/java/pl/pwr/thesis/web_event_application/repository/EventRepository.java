package pl.pwr.thesis.web_event_application.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import pl.pwr.thesis.web_event_application.entity.Event;
import pl.pwr.thesis.web_event_application.entity.Location;

import java.time.LocalDateTime;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    boolean existsByNameAndLocationAndStartDateAndEndDate(String name, Location location,
                                                          LocalDateTime startDate,
                                                          LocalDateTime endDate);

    @EntityGraph(value = "event-with-location")
    List<Event> findAll(Specification<Event> spec);

    @EntityGraph(value = "event-with-full-details")
    Page<Event> findAll(Specification<Event> spec, Pageable pageable);
}
