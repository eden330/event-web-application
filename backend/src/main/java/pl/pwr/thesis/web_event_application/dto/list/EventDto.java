package pl.pwr.thesis.web_event_application.dto.list;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EventDto {

    private Long id;
    private String name;
    private String image;
    private String startDate;
    private String endDate;
    private LocationDto location;
    private CategoryDto category;
}
