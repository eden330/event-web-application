package pl.pwr.thesis.web_event_application.entity.embedded;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import pl.pwr.thesis.web_event_application.entity.Event;
import pl.pwr.thesis.web_event_application.entity.User;
import pl.pwr.thesis.web_event_application.enums.ReactionType;

@Entity
@Table(name = "reactions")
@NoArgsConstructor
@Data
public class Reaction {

    @EmbeddedId // the primary key is an embedded key, which is the ReactionKey composite key
    private ReactionKey id;
    @ManyToOne
    @MapsId("user_id")
    @JoinColumn(name = "user_id")
    @ToString.Exclude
    private User user;
    @ManyToOne
    @MapsId("event_id")
    @JoinColumn(name = "event_id")
    @ToString.Exclude
    private Event event;
    @Column(name = "type")
    @Enumerated(EnumType.STRING)
    private ReactionType type;

    public Reaction(User user, Event event, ReactionType type) {
        this.user = user;
        this.event = event;
        this.type = type;

        this.id = new ReactionKey();
        this.id.setUser_id(user.getId());
        this.id.setEvent_id(event.getId());
    }
}
