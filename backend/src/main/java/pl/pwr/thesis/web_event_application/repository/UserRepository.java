package pl.pwr.thesis.web_event_application.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.pwr.thesis.web_event_application.entity.Event;
import pl.pwr.thesis.web_event_application.entity.User;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {

    User findUserByUsername(String username);

    User findUserByEmail(String email);

    List<Event> findUserFavouriteEventsByUserId(Long userId);

}
