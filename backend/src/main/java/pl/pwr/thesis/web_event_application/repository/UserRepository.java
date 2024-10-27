package pl.pwr.thesis.web_event_application.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pl.pwr.thesis.web_event_application.entity.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findUserByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    @EntityGraph(attributePaths = {"userInformation"})
    Optional<User> findUserWithUserInformationById(Long id);

    @EntityGraph(attributePaths = {"favouriteEvents"})
    Optional<User> findUserWithFavouriteEventsById(Long id);

    @Query("SELECT DISTINCT u FROM User u JOIN FETCH u.favouriteEvents e WHERE e IS NOT NULL")
    List<User> findAllWithFavouriteEvents();

    @EntityGraph(attributePaths = {"reactions"})
    Optional<User> findUserWithEventReactionsById(Long id);

    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END " +
            "FROM User u JOIN u.favouriteEvents e " +
            "WHERE u.id = :userId AND e.id = :eventId")
    boolean isEventInUserFavourites(@Param("userId") Long userId, @Param("eventId") Long eventId);
}
