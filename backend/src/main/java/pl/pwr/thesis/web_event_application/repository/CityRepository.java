package pl.pwr.thesis.web_event_application.repository;

import org.springframework.data.repository.CrudRepository;
import pl.pwr.thesis.web_event_application.entity.City;

public interface CityRepository extends CrudRepository<City, Long> {

}
