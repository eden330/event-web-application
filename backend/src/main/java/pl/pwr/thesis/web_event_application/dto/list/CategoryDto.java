package pl.pwr.thesis.web_event_application.dto;

import lombok.Getter;
import lombok.Setter;
import pl.pwr.thesis.web_event_application.enums.EventCategory;

@Getter
@Setter
public class CategoryDto {

    private Integer id;

    private EventCategory eventCategory;
}
