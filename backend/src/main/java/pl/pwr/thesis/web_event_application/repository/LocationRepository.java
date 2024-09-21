package pl.pwr.thesis.web_event_application.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.pwr.thesis.web_event_application.entity.Location;

import java.util.Optional;

public interface LocationRepository extends JpaRepository<Location, Long> {

    Optional<Location> findLocationByNameAndAddressId(String locationName, Long addressId);
}
