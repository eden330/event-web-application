package pl.pwr.thesis.web_event_application.dto.user;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import pl.pwr.thesis.web_event_application.enums.ReactionType;

@Getter
@Setter
@AllArgsConstructor
public class ReactedEventDto {

    private Long eventId;
    private String reactionType;

    public ReactedEventDto(Long eventId, ReactionType reactionType) {
        this.eventId = eventId;
        this.reactionType = reactionType.toString();
    }
}
