package pl.pwr.thesis.web_event_application.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pl.pwr.thesis.web_event_application.entity.Event;
import pl.pwr.thesis.web_event_application.entity.Location;

import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {

    Optional<Event> findEventByName(String eventName);

    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END FROM Event e " +
            "WHERE e.name = :name AND e.location.address.street = :street " +
            "AND e.location.address.city.name = :cityName AND e.location.name = :locationName")
    boolean existsByEventDetails(@Param("name") String eventName,
                                 @Param("street") String streetName,
                                 @Param("cityName") String cityName,
                                 @Param("locationName") String locationName);

    boolean existsByNameAndLocation(String name, Location location);

    @Query("SELECT e FROM Event e WHERE e.location.address.city.id = :cityId")
    List<Event> findEventsByCityId(@Param("cityId") Long cityId);

    List<Event> findEventsByCategoryId(Long categoryId);
}
