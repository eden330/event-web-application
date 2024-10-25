package pl.pwr.thesis.web_event_application.entity.embedded;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@NoArgsConstructor
@Data
@EqualsAndHashCode
@Embeddable // the class is meant to be embedded as part of another entity.
// It serves as a composite key
public class ReactionKey implements Serializable {

    @Column(name = "user_id")
    private Long user_id;
    @Column(name = "event_id")
    private Long event_id;
}
