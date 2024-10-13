package pl.pwr.thesis.web_event_application.repository.specification;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.jpa.domain.Specification;
import pl.pwr.thesis.web_event_application.entity.Event;
import pl.pwr.thesis.web_event_application.entity.Location;
import pl.pwr.thesis.web_event_application.enums.EventCategory;

public class EventSpecifications {

    private static Logger logger = LoggerFactory.getLogger(EventSpecifications.class);

    public static Specification<Event> hasCityName(String cityName) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(
                root.get("location").get("address").get("city").get("name"), cityName);
    }

    public static Specification<Event> hasCategory(EventCategory category) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(
                root.get("category").get("eventCategory"), category
        );
    }

    public static Specification<Event> eventTitleOrLocationOrCityContains(String searchTerm) {
        return (root, query, criteriaBuilder) -> {
            String pattern = "%" + searchTerm.toLowerCase() + "%";
            logger.info("Starting search events with term: {}", searchTerm);

            Predicate eventTitlePredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("name")), pattern);

            Join<Event, Location> locationJoin = root.join("location");

            Predicate locationNamePredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(locationJoin.get("name")), pattern
            );

            return criteriaBuilder.or(eventTitlePredicate, locationNamePredicate);
        };
    }
}
