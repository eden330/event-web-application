package pl.pwr.thesis.web_event_application.dto.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LogoutRequest {

    private Long userId;
}
