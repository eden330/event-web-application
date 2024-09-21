package pl.pwr.thesis.web_event_application.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.pwr.thesis.web_event_application.entity.Address;

import java.util.Optional;

public interface AddressRepository extends JpaRepository<Address, Long> {

    Optional<Address> findAddressByStreetAndCityId(String streetName, Long cityId);
}
