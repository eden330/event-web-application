package pl.pwr.thesis.web_event_application.entity;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import pl.pwr.thesis.web_event_application.entity.embedded.Reaction;
import pl.pwr.thesis.web_event_application.scraper.EventDeserializer;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "event")
@NoArgsConstructor
@Data
@JsonDeserialize(using = EventDeserializer.class)
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;
    @Column(name = "name")
    private String name;
    @Column(name = "description")
    private String description;
    @Column(name = "image")
    private String image;
    @Column(name = "start_date")
    private LocalDateTime startDate;
    @Column(name = "end_date")
    private LocalDateTime endDate;
    @ManyToMany(mappedBy = "favouriteEvents")
    @ToString.Exclude
    private List<User> users;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private Location location;
    @OneToMany(mappedBy = "event")
    private List<Reaction> reactions;
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;
}
