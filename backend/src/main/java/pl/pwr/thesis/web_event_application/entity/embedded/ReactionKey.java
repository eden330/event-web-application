package pl.pwr.thesis.web_event_application.entity.embedded;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@NoArgsConstructor
@Setter
@Getter
@EqualsAndHashCode
@Embeddable // the class is meant to be embedded as part of another entity. It serves as a composite key
public class ReactionKey implements Serializable {

    @Column(name = "user_id")
    private Integer user_id;
    @Column(name = "event_id")
    private Integer event_id;
}
