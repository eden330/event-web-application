package pl.pwr.thesis.web_event_application.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.pwr.thesis.web_event_application.entity.Event;
import pl.pwr.thesis.web_event_application.entity.Notification;
import pl.pwr.thesis.web_event_application.entity.User;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    boolean existsByUserAndEvent(User user, Event event);

}
