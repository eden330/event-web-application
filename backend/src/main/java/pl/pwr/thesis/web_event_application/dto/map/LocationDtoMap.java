package pl.pwr.thesis.web_event_application.dto.map;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LocationDtoMap {

    private Long id;
    private String name;
    private double latitude;
    private double longitude;

}
