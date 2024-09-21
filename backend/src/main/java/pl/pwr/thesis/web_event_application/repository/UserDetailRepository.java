package pl.pwr.thesis.web_event_application.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.pwr.thesis.web_event_application.entity.UserDetail;

public interface UserDetailRepository extends JpaRepository<UserDetail, Long> {

    UserDetail findUserDetailsById(Long userId);
}
