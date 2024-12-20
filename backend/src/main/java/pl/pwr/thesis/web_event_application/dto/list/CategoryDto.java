package pl.pwr.thesis.web_event_application.dto.list;

import lombok.Getter;
import lombok.Setter;
import pl.pwr.thesis.web_event_application.enums.EventCategory;

@Getter
@Setter
public class CategoryDto {

    private Integer id;
    private String image;
    private EventCategory eventCategory;
}
