package pl.pwr.thesis.web_event_application.dto.map;

import lombok.Getter;
import lombok.Setter;
import pl.pwr.thesis.web_event_application.dto.list.LocationDto;

@Getter
@Setter
public class EventDtoMap {

    private Long id;
    private String name;
    private String image;
    private String startDate;
    private String endDate;
    private LocationDto location;

}