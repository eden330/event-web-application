package pl.pwr.thesis.web_event_application.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.pwr.thesis.web_event_application.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
