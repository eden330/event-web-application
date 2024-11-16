package pl.pwr.thesis.web_event_application.dto.payload.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UpdateRequest {

    private String username;
    private String email;
    private List<Long> categoriesId;
    private Long cityId;
}
