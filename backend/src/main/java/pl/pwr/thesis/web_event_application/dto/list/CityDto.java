package pl.pwr.thesis.web_event_application.dto.list;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CityDto {

    private Long id;
    private String name;
    private double latitude;
    private double longitude;
}
