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
import jakarta.persistence.NamedAttributeNode;
import jakarta.persistence.NamedEntityGraph;
import jakarta.persistence.NamedEntityGraphs;
import jakarta.persistence.NamedSubgraph;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import pl.pwr.thesis.web_event_application.entity.embedded.Reaction;
import pl.pwr.thesis.web_event_application.scraper.EventDeserializer;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Entity
@NamedEntityGraphs({
        @NamedEntityGraph(
                name = "event-with-location",
                attributeNodes = @NamedAttributeNode("location")
        ),
        @NamedEntityGraph(
                name = "event-with-full-details",
                attributeNodes = {
                        @NamedAttributeNode(value = "location", subgraph = "location-with-address")
                },
                subgraphs = {
                        @NamedSubgraph(
                                name = "location-with-address",
                                attributeNodes = {
                                        @NamedAttributeNode(value = "address", subgraph = "address-with-city")
                                }
                        ),
                        @NamedSubgraph(
                                name = "address-with-city",
                                attributeNodes = @NamedAttributeNode("city")
                        )
                }
        )
})
@Table(name = "events")
@NoArgsConstructor
@Data
@JsonDeserialize(using = EventDeserializer.class)
@EqualsAndHashCode
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
    @ManyToMany(mappedBy = "favouriteEvents", fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<User> users;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private Location location;
    @OneToMany(mappedBy = "event")
    private Set<Reaction> reactions;
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

}
