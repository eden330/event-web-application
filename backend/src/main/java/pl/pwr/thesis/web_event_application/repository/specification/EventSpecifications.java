package pl.pwr.thesis.web_event_application.repository.specification;

import org.springframework.data.jpa.domain.Specification;
import pl.pwr.thesis.web_event_application.entity.Event;
import pl.pwr.thesis.web_event_application.enums.EventCategory;

public class EventSpecifications {

    public static Specification<Event> hasCityName(String cityName) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(
                root.get("location").get("address").get("city").get("name"), cityName);
    }

    public static Specification<Event> hasCategory(EventCategory category) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(
                root.get("category").get("eventCategory"), category
        );
    }
}
